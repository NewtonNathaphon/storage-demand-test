import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest,validateIntake} from '../functions/api/intake.js';
import {onRequest as backoffice} from '../functions/api/backoffice.js';
const id='12345678-1234-4123-8123-123456789abc';
const body={submission_id:id,consent:true,images:['data:image/jpeg;base64,/9j/AA=='],row:{name:'TEST PHOTO',phone:'0000000000',size:'3_4',customer_use:JSON.stringify({kind:'demand_validation_v2',requested_size:'3_4',photos:[{bucket:'evil',path:'evil'}],lead_status:'QUALIFIED'})}};
const req=()=>new Request('https://storagebuddyth.com/api/intake',{method:'POST',headers:{Origin:'https://storagebuddyth.com','Content-Type':'application/json'},body:JSON.stringify(body)});
const env={STORAGE_BACKOFFICE_KEY:'test-secret',LOCAL_DEV:'true'};
test('photo intake validates input, strips client storage paths and forces new status',()=>{const input=validateIntake(body);assert.equal(input.details.lead_status,'NEW');assert.equal(input.details.photos,undefined);assert.throws(()=>validateIntake({...body,consent:false}));assert.throws(()=>validateIntake({...body,images:['data:text/html;base64,AAAA']}));assert.throws(()=>validateIntake({...body,images:Array(5).fill(body.images[0])}));});
test('photo intake uploads privately before saving references; retries do not duplicate',async()=>{
 const original=global.fetch,calls=[];let completed=false,saved;
 global.fetch=async(url,options={})=>{calls.push(String(url));if(url.includes('customer_use=like'))return Response.json(completed?[{id:17}]:[]);if(url.includes('/bucket/'))return Response.json({public:false});if(url.includes('/object/')){assert.equal(options.headers['Content-Type'],'image/jpeg');return Response.json({});}if(url.endsWith('/leads')){saved=JSON.parse(options.body);completed=true;return new Response(null,{status:201});}throw Error('Unexpected '+url);};
 try{assert.equal((await onRequest({request:req(),env})).status,200);const d=JSON.parse(saved.customer_use);assert.equal(d.photos[0].path,id+'/0.jpg');assert.equal(d.photos[0].bucket,'lead-photos');assert(!saved.customer_use.includes('base64'));const n=calls.length;assert.equal((await onRequest({request:req(),env})).status,200);assert.equal(calls.length,n+1);}finally{global.fetch=original;}
});
test('failed photo upload does not create a lead and public bucket is rejected',async()=>{
 const original=global.fetch;let inserted=false,publicBucket=false;
 global.fetch=async(url)=>{if(url.includes('customer_use=like'))return Response.json([]);if(url.includes('/bucket/'))return Response.json({public:publicBucket});if(url.includes('/object/'))return new Response('{}',{status:500});if(url.endsWith('/leads'))inserted=true;return Response.json({});};
 try{assert.equal((await onRequest({request:req(),env})).status,503);publicBucket=true;assert.equal((await onRequest({request:req(),env})).status,503);assert.equal(inserted,false);}finally{global.fetch=original;}
});
test('private photo URLs require active owner and only sign paths from the lead',async()=>{
 const original=global.fetch;let role='staff',signed=0;
 global.fetch=async(url)=>{if(url.includes('/auth/v1/user'))return Response.json({id:'user'});if(url.includes('ccaqr_user_profiles'))return Response.json([{role,active:true}]);if(url.includes('/rest/v1/leads'))return Response.json([{customer_use:JSON.stringify({photos:[{bucket:'lead-photos',path:id+'/0.jpg'},{bucket:'lead-photos',path:'../../other'}]})}]);if(url.includes('/object/sign/')){signed++;return Response.json({signedURL:'/object/sign/lead-photos/'+id+'/0.jpg?token=test'});}throw Error('Unexpected '+url);};
 const request=()=>new Request('https://storagebuddyth.com/api/backoffice?resource=lead_photos&lead_id=17',{headers:{Authorization:'Bearer test.token',Origin:'https://storagebuddyth.com'}});
 try{assert.equal((await backoffice({request:request(),env})).status,403);assert.equal(signed,0);role='owner';const res=await backoffice({request:request(),env});assert.equal(res.status,200);assert.equal((await res.json()).length,1);assert.equal(signed,1);}finally{global.fetch=original;}
});
