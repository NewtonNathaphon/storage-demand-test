import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest,validateDaily} from '../functions/api/ads-ingest.js';
const secret='x'.repeat(40),now=Date.parse('2026-11-13T07:00:00Z');
const row={day:'2026-11-12',impressions:900,clicks:30,cost_thb:1000.456,conversions:1,line_clicks:1,reservations:0,quote_requests:0,channel:'google_ads',currency:'THB'};
const req=(body,auth='Bearer '+secret)=>new Request('https://storagebuddyth.com/api/ads-ingest',{method:'POST',headers:{authorization:auth,'content-type':'application/json'},body:JSON.stringify(body)});
test('ads feed validates days, numbers and currency',()=>{
 const [r]=validateDaily({rows:[row]},now);assert.equal(r.cost_thb,1000.46);assert.equal(r.channel,'google_ads');
 for(const bad of [{...row,day:'2026-02-30'},{...row,day:'2027-01-01'},{...row,clicks:1.5},{...row,cost_thb:-1},{...row,impressions:'9'},{...row,currency:'USD'}])assert.throws(()=>validateDaily({rows:[bad]},now));
 assert.throws(()=>validateDaily({rows:[row,row]},now),'duplicate days rejected');assert.throws(()=>validateDaily({rows:[]},now));
});
test('ads feed needs the shared secret and only writes ad_daily with the server key',async()=>{
 const env={ADS_INGEST_TOKEN:secret,STORAGE_BACKOFFICE_KEY:'service-key'};
 assert.equal((await onRequest({request:req({rows:[row]}),env:{}})).status,503,'not configured fails closed');
 assert.equal((await onRequest({request:req({rows:[row]},'Bearer wrong'),env})).status,401);
 assert.equal((await onRequest({request:new Request('https://storagebuddyth.com/api/ads-ingest'),env})).status,405);
 const original=globalThis.fetch,calls=[];try{globalThis.fetch=async(url,options)=>{calls.push({url:String(url),options});return new Response(null,{status:201});};
  const today=new Date().toISOString().slice(0,10);const res=await onRequest({request:req({rows:[{...row,day:today}]}),env});assert.equal(res.status,200);assert.deepEqual(await res.json(),{saved:1});
  assert.equal(calls.length,1,'env secret matches without a key lookup');assert(calls[0].url.endsWith('/rest/v1/ad_daily?on_conflict=day,channel'));assert.equal(calls[0].options.headers.apikey,'service-key');
  assert.equal((await onRequest({request:req({rows:[{...row,day:today,currency:'USD'}]}),env})).status,400);assert.equal(calls.length,1,'invalid data never reaches the database');
 }finally{globalThis.fetch=original;}
});
test('ads feed also accepts a key whose SHA-256 is active in ad_ingest_keys, and nothing else',async()=>{
 const key='k'.repeat(64),hash='3c2baf3e2a7e5a2b2fbb5a6e0dbbd1c7b5d3f74c7fa0e7f7d7b0b0e4c8f1a1b2';const env={STORAGE_BACKOFFICE_KEY:'service-key'};const today=new Date().toISOString().slice(0,10);
 const expected=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key)))].map(b=>b.toString(16).padStart(2,'0')).join('');
 const original=globalThis.fetch,calls=[];try{globalThis.fetch=async(url,options)=>{url=String(url);calls.push(url);if(url.includes('/ad_ingest_keys'))return Response.json(url.includes('key_hash=eq.'+expected)?[{key_hash:expected}]:[]);return new Response(null,{status:201});};
  assert.equal((await onRequest({request:req({rows:[{...row,day:today}]},'Bearer '+key),env})).status,200);assert(calls.some(u=>u.includes('/ad_daily')));
  calls.length=0;assert.equal((await onRequest({request:req({rows:[{...row,day:today}]},'Bearer '+'z'.repeat(64)),env})).status,401);assert(!calls.some(u=>u.includes('/ad_daily')),'unknown key never writes');
  assert.equal((await onRequest({request:req({rows:[{...row,day:today}]},'Bearer short'),env})).status,401);
 }finally{globalThis.fetch=original;}
});
