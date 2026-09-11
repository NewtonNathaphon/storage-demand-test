import test from 'node:test';
import assert from 'node:assert/strict';
import {validateInput,validateEstimate,onRequest} from '../functions/api/estimate.js';
const input={consent:true,language:'en',description:'10 boxes of books, 40 x 30 x 30cm each',images:[]};
const estimate={min_sqm:1,max_sqm:2,confidence:'low',reasoning:'Allows space for unstackable items and retrieval.',items:['10 boxes'],questions:['Can the boxes be stacked?']};
const request=(body=input,overrides={})=>new Request('https://getstorage.pages.dev/api/estimate',{method:'POST',headers:{origin:'https://getstorage.pages.dev','Content-Type':'application/json'},body:JSON.stringify(body),...overrides});
test('validates consent, meaningful inventory, image signatures and bounds',()=>{
  assert.equal(validateInput(input).description,input.description);
  for(const patch of [{consent:false},{description:'x'},{images:Array(5).fill('data:image/jpeg;base64,/9j/')},{images:['data:image/jpeg;base64,dGVzdA==']},{description:'x'.repeat(1601)}])assert.throws(()=>validateInput({...input,...patch}));
});
test('rejects exact, impossible or malformed AI claims',()=>{
  assert.equal(validateEstimate(estimate).source,'anthropic_vision');
  for(const patch of [{min_sqm:NaN},{min_sqm:-1},{max_sqm:1},{max_sqm:101},{confidence:'high'},{questions:['x'.repeat(401)]},{items:'boxes'},{min_sqm:'1'},{insufficient_info:true}])assert.throws(()=>validateEstimate({...estimate,...patch}));
});
test('rejects cross-origin, missing consent, oversize and absent configuration before provider calls',async()=>{
  const env={ANTHROPIC_API_KEY:'test-key',LOCAL_DEV:'true'};
  assert.equal((await onRequest({request:request(input,{headers:{origin:'https://attacker.example'}}),env})).status,403);
  assert.equal((await onRequest({request:request({...input,consent:false}),env})).status,400);
  assert.equal((await onRequest({request:request(input,{headers:{origin:'https://getstorage.pages.dev','content-type':'application/json','content-length':'4000000'}}),env})).status,413);
  assert.equal((await onRequest({request:request(),env:{}})).status,503);
});
test('provider success is validated and failures never become fabricated estimates',async()=>{
  const original=globalThis.fetch,env={ANTHROPIC_API_KEY:'test-key',LOCAL_DEV:'true'};
  try{
    globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.anthropic.com/v1/messages');const body=JSON.parse(options.body);assert.equal(body.model,'claude-opus-5');assert.ok(body.system.includes('untrusted'));assert.ok(body.system.includes('never add an object that was not provided'),'items anti-invention rule must stay in the prompt');assert.ok(body.system.includes('Assuming typical dimensions'),'the model must still be allowed to assume dimensions');assert.ok(body.max_tokens>=4000,'adaptive thinking shares max_tokens with the answer');return Response.json({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify(estimate)}]});};
    let result=await onRequest({request:request(),env});assert.equal(result.status,200);assert.equal(result.headers.get('cache-control'),'no-store');assert.equal((await result.json()).max_sqm,2);
    globalThis.fetch=async()=>Response.json({error:'provider secret debug'}, {status:429});result=await onRequest({request:request(),env});assert.equal(result.status,503);assert.ok(!(await result.text()).includes('secret'));
    globalThis.fetch=async()=>Response.json({stop_reason:'end_turn',content:[{type:'text',text:'{"min_sqm":-10}'}]});assert.equal((await onRequest({request:request(),env})).status,502);
    globalThis.fetch=async()=>Response.json({stop_reason:'end_turn',content:[{type:'text',text:'{"insufficient_info":true}'}]});assert.equal((await onRequest({request:request(),env})).status,422);
  }finally{globalThis.fetch=original;}
});
