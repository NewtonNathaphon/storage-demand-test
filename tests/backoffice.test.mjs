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

test('demand statuses persist in owner history without changing constrained legacy status columns',async()=>{
 const original=globalThis.fetch;let row={lead_id:4,status:'new',notes:'Prior note',contacted_on:null,follow_up_on:null,updated_at:'2026-09-15T00:00:00Z'};
 try{globalThis.fetch=async(url,options={})=>{if(url.includes('/auth/v1/user'))return Response.json({id:'owner'});if(url.includes('/ccaqr_user_profiles'))return Response.json([{role:'owner',active:true,display_name:'Owner'}]);if(!options.method)return Response.json([row]);row=JSON.parse(options.body);return Response.json([row]);};
 const action=extra=>onRequest({env:{STORAGE_BACKOFFICE_KEY:'test'},request:req('resource=lead_action',{method:'POST',body:JSON.stringify({lead_id:4,action:'update',expected_updated_at:row.updated_at,status:'quoted',notes:'Customer can confirm',contacted_on:null,follow_up_on:null,...extra})})});
 assert.equal((await action({demand_status:'READY_TO_CONFIRM'})).status,200);assert.equal(row.status,'quoted');const meta=JSON.parse(row.notes);assert.equal(meta.demand_status,'READY_TO_CONFIRM');assert.equal(meta.history[0].changes.demand_status.to,'READY_TO_CONFIRM');assert.equal(meta.notes,'Customer can confirm');
 assert.equal((await action({demand_status:'arbitrary'})).status,400);assert.equal((await action({demand_status:null,status:'contacted'})).status,200);assert.equal(JSON.parse(row.notes).demand_status,undefined);
 }finally{globalThis.fetch=original;}
});
test('ad spend: owner-only, validated month/channel/amount, upsert by month and channel',async()=>{
  const {validateAdSpend}=await import('../functions/api/backoffice.js');
  assert.deepEqual(validateAdSpend({month:'2026-11',channel:'google_ads',amount_thb:1234.5,note:' receipt 7 '}),{month:'2026-11-01',channel:'google_ads',amount_thb:1234.5,note:'receipt 7'});
  for(const bad of [{month:'2026-13',channel:'google_ads',amount_thb:1,note:''},{month:'2026-11',channel:'tiktok',amount_thb:1,note:''},{month:'2026-11',channel:'google_ads',amount_thb:-1,note:''},{month:'2026-11',channel:'google_ads',amount_thb:1.234,note:''},{month:'2026-11',channel:'google_ads',amount_thb:'5',note:''},{month:'2026-11',channel:'google_ads',amount_thb:1,note:'x'.repeat(501)}])assert.throws(()=>validateAdSpend(bad));
  const original=globalThis.fetch,calls=[];try{
    globalThis.fetch=async(url,options={})=>{calls.push({url:String(url),options});if(String(url).includes('/auth/v1/user'))return Response.json({id:'user',email:'owner@example.com'});if(String(url).includes('ccaqr_user_profiles'))return Response.json([{role:'owner',active:true,display_name:'Owner'}]);if(String(url).includes('/rest/v1/ad_spend'))return Response.json(options.method==='POST'?[JSON.parse(options.body)]:[]);return Response.json([]);};
    const env={STORAGE_BACKOFFICE_KEY:'service-key'};
    assert.equal((await onRequest({request:req('resource=ad_spend'),env})).status,200);assert(calls.at(-1).url.includes('/rest/v1/ad_spend?select=month,channel,amount_thb'));
    const post=body=>req('resource=ad_spend',{method:'POST',headers:{origin,authorization:'Bearer test.token.value','content-type':'application/json'},body:JSON.stringify(body)});
    assert.equal((await onRequest({request:post({month:'2026-11',channel:'google_ads',amount_thb:-5,note:''}),env})).status,400);
    const ok=await onRequest({request:post({month:'2026-11',channel:'google_ads',amount_thb:900,note:'n'}),env});assert.equal(ok.status,200);
    const saved=calls.at(-1);assert(saved.url.endsWith('/rest/v1/ad_spend?on_conflict=month,channel'));assert.equal(saved.options.headers.apikey,'service-key');const row=JSON.parse(saved.options.body);assert.equal(row.month,'2026-11-01');assert.equal(row.updated_by,'Owner');
    globalThis.fetch=async url=>String(url).includes('/auth/v1/user')?Response.json({id:'user'}):Response.json([{role:'admin',active:true}]);
    assert.equal((await onRequest({request:post({month:'2026-11',channel:'google_ads',amount_thb:900,note:''}),env})).status,403,'non-owners cannot write spend');
  }finally{globalThis.fetch=original;}
});
