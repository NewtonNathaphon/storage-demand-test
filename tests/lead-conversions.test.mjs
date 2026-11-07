import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const source=readFileSync(new URL('../assets/registration.js',import.meta.url),'utf8');
const config=createRequire(import.meta.url)('../demand-config.cjs');
const reservation='AW-16778280533/c4qzCMDIurMdENX8wMA-';
const quote='AW-16778280533/aIXhCOD09LMdENX8wMA-';
function harness({size='4',duration='3_months',photos=false}={}){
 const events=[],rows=[],elements=new Map();let result=true,pending=null;
 const element=id=>{if(!elements.has(id))elements.set(id,{value:id==='website'?'':'test',checked:false,focus(){},scrollIntoView(){}});return elements.get(id);};
 const choices={requested_size:size,expected_duration:duration,contact_preference:'phone',customer_type:'individual'};
 const save=async(_table,row)=>{rows.push(row);return pending?pending:result;};
 const context={window:{crypto:{randomUUID:()=> 'test-attempt-id'},gtag:(...args)=>events.push(args)},Date,Math,params:new URLSearchParams(),DEMAND_CONFIG:config,ROOMS:config.rooms,PLANS:Object.fromEntries([...config.plans,...config.founding.plans].map(p=>[p.id,p])),
 $:element,chosen:name=>choices[name]||'',uses:()=>['personal'],sizeRange:s=>s<=2?'1_2':s<=4?'3_4':s<=6?'5_6':s<=10?'7_10':'over_10',
 source:'test',lang:'en',step:2,busy:false,submitted:false,context:null,questionnaireEstimate:null,moveIn:()=>({code:'now',date:null}),isCompany:()=>false,taxDigits:()=>'',navigator:{userAgent:'test'},summaryText:()=>'',savedSummary:'',updateQuote(){},showStep(){},validateStep:()=>true,track(){},fail(){},t:(_th,en)=>en,document:{querySelector:()=>element('progress')},sbInsert:save};
 if(photos)context.window.saveQuestionnaireWithPhotos=row=>save('leads',row);
 vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf('// One non-personal ID'),source.indexOf('let lang=')),context);
 for(const name of ['selection','planFor','priceFor','activeQuote'])vm.runInContext(source.split('\n').find(line=>line.startsWith(`function ${name}(`)),context);
 vm.runInContext(source.slice(source.indexOf("$('demandForm').onsubmit="),source.indexOf("$('successLine').onclick=")),context);
 return {events,rows,context,submit:()=>element('demandForm').onsubmit({preventDefault(){}}),setResult:value=>result=value,setPending:value=>pending=value};
}
for(const photos of [false,true])for(const size of ['4','locker','unsure','3','over_10'])test(`saved ${size}, ${photos?'photo':'plain'} path uses only its own conversion`,async()=>{
 const h=harness({size,photos});assert.equal(h.events.length,0);await h.submit();
 const expected=['4','locker'].includes(size)?reservation:quote;
 assert.equal(h.events.length,1);assert.equal(h.events[0][2].send_to,expected);assert.equal(h.events[0][2].transaction_id,'test-attempt-id');
 assert.deepEqual(Object.keys(h.events[0][2]),['send_to','transaction_id']);
 const details=JSON.parse(h.rows[0].customer_use);assert.equal(details.next_step,expected===reservation?'reserve_free':'quote_request');assert.equal(details.payment_status,'not_collected');
 await h.submit();vm.runInContext("trackSavedLead('reserve_free');trackSavedLead('quote_request')",h.context);assert.equal(h.events.length,1);assert.equal(h.rows.length,1);
});
test('failed save has no conversion; retry converts once with the same attempt ID',async()=>{
 const h=harness();h.setResult(false);await h.submit();assert.equal(h.events.length,0);assert.equal(h.context.submitted,false);
 h.setResult(true);await h.submit();assert.equal(h.events.length,1);assert.equal(h.events[0][2].transaction_id,'test-attempt-id');
});
test('concurrent submit is ignored while persistence is pending',async()=>{
 const h=harness();let resolve;h.setPending(new Promise(r=>resolve=r));const first=h.submit();await h.submit();assert.equal(h.rows.length,1);assert.equal(h.events.length,0);resolve(true);await first;assert.equal(h.events.length,1);
});
test('missing or throwing analytics does not undo the saved result',async()=>{
 for(const gtag of [undefined,()=>{throw Error('blocked');}]){const h=harness();h.context.window.gtag=gtag;await h.submit();assert.equal(h.context.submitted,true);assert.equal(h.events.length,0);}
});
test('unsupported action does not convert; reload alone does not convert',()=>{
 const h=harness();vm.runInContext("trackSavedLead('interested')",h.context);assert.equal(h.events.length,0);assert.equal(harness().events.length,0);
});
