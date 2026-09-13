import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest,validateFollowup} from '../functions/api/backoffice.js';
const origin='https://storagebuddyth.com';
const req=(query='resource=identity',options={})=>new Request(origin+'/api/backoffice?'+query,{headers:{origin,authorization:'Bearer test.token.value'},...options});
test('back office fails closed for missing tokens, unsupported resources, origins and non-owner roles',async()=>{
  assert.equal((await onRequest({request:req('resource=identity',{headers:{}}),env:{}})).status,401);
  assert.equal((await onRequest({request:req('resource=identity',{headers:{origin:'https://evil.example',authorization:'Bearer t'}}),env:{}})).status,403);
  assert.equal((await onRequest({request:req('resource=flowcraft_archive'),env:{}})).status,404);
  const original=globalThis.fetch;try{globalThis.fetch=async url=>url.includes('/auth/v1/user')?Response.json({id:'user'}):Response.json([{role:'admin',active:true}]);assert.equal((await onRequest({request:req(),env:{}})).status,403);globalThis.fetch=async()=>Response.json({}, {status:401});assert.equal((await onRequest({request:req(),env:{}})).status,401);}finally{globalThis.fetch=original;}
});
test('active owner sees only allowlisted fields and can save valid follow-ups',async()=>{
 const original=globalThis.fetch,env={STORAGE_BACKOFFICE_KEY:'sb_secret_test'};let target,options;
 try{globalThis.fetch=async(url,opts)=>{if(url.includes('/auth/v1/user'))return Response.json({id:'owner',email:'owner@ccaqr.local'});if(url.includes('/ccaqr_user_profiles'))return Response.json([{role:'owner',active:true}]);target=url;options=opts;return Response.json([{id:9}]);};
 const result=await onRequest({request:req('resource=leads&select=*&created_at=gte.2026-09-01T00:00:00Z&created_at=lt.2026-10-01T00:00:00Z'),env});assert.equal(result.status,200);assert(!target.includes('select=*'));assert(!target.includes('user_agent'));assert.equal(options.headers.apikey,env.STORAGE_BACKOFFICE_KEY);assert(!(await result.text()).includes('sb_secret'));assert.equal(result.headers.get('cache-control'),'no-store');
 const body={lead_id:9,status:'contacted',notes:'Follow up next week',contacted_on:'2026-09-12',follow_up_on:'2026-09-19'};assert.equal((await onRequest({request:req('resource=lead_followups',{method:'POST',headers:{origin,authorization:'Bearer owner.token','content-type':'application/json'},body:JSON.stringify(body)}),env})).status,200);assert.equal(JSON.parse(options.body).status,'contacted');
 assert.equal((await onRequest({request:req('resource=leads'),env})).status,400);
 }finally{globalThis.fetch=original;}
});
test('follow-up validation rejects invalid dates, oversized notes and unknown statuses',()=>{const value={lead_id:9,status:'new',notes:'',contacted_on:null,follow_up_on:null};assert.equal(validateFollowup(value).lead_id,9);for(const patch of [{lead_id:-1},{status:'delete'},{notes:'x'.repeat(10001)},{contacted_on:'2026-02-31'},{follow_up_on:'tomorrow'}])assert.throws(()=>validateFollowup({...value,...patch}));});

test('card history preserves notes, appends comments, handles trash/restore and rejects stale writes',async()=>{
 const original=globalThis.fetch,env={STORAGE_BACKOFFICE_KEY:'test'};let row={lead_id:9,status:'new',notes:'Legacy notes',contacted_on:null,follow_up_on:null,updated_at:'2026-09-01T00:00:00Z'};
 try{globalThis.fetch=async(url,opts={})=>{if(url.includes('/auth/v1/user'))return Response.json({id:'owner',email:'owner@test'});if(url.includes('/ccaqr_user_profiles'))return Response.json([{role:'owner',active:true,display_name:'Owner'}]);if(!opts.method)return Response.json([row]);assert.equal(opts.method,'PATCH');assert(url.includes('updated_at=eq.'));row=JSON.parse(opts.body);return Response.json([row]);};
 const action=async(action,extra={})=>onRequest({env,request:req('resource=lead_action',{method:'POST',body:JSON.stringify({lead_id:9,expected_updated_at:row.updated_at,action,...extra})})});
 assert.equal((await action('comment',{comment:'Called customer'})).status,200);let m=JSON.parse(row.notes);assert.equal(m.notes,'Legacy notes');assert.equal(m.history[0].text,'Called customer');assert.equal(m.history[0].actor,'Owner');
 assert.equal((await action('update',{status:'quoted',notes:'New note',contacted_on:'2026-09-13',follow_up_on:null})).status,200);assert.equal(JSON.parse(row.notes).history[1].changes.status.to,'quoted');
 assert.equal((await action('delete')).status,200);assert(JSON.parse(row.notes).deleted);assert.equal((await action('restore')).status,200);assert.equal(JSON.parse(row.notes).deleted,false);
 assert.equal((await action('comment',{comment:'stale',expected_updated_at:'2000-01-01T00:00:00Z'})).status,409);assert.equal(JSON.parse(row.notes).history.length,4);
 }finally{globalThis.fetch=original;}
});
