const assert=require('node:assert/strict');
const {launchBrowser,outputPath}=require('./browser-runtime.cjs');
const config=require('../demand-config.cjs');
(async()=>{const b=await launchBrowser();try{
 const p=await b.newPage();
 await p.goto('http://127.0.0.1:8788/register/?lang=en');
 await p.locator('[name="use_case"][value="moving"]').check();
 await p.locator('[name="requested_size"][value="4"]').check();
 await p.locator('#nextBtn').click();
 await p.locator('[name="desired_move_in"][value="unsure"]').check();
 const prices=[['locker',780],...config.rooms.map(r=>[String(r.sqm),r.monthly])];
 const durations=[['1_month',1,1,0],['3_months',3,3,5],['6_months',6,4,0],['12_months',12,7,0],['over_12_months',12,7,0]];
 for(const language of ['en','th']){
  await p.evaluate(language=>setLanguage(language),language);
  for(const [size,monthly]of prices)for(const[duration,months,paid,discount]of durations){
   await p.evaluate(({size,duration})=>{document.querySelector('[name="requested_size"][value="'+size+'"]').checked=true;document.querySelector('[name="expected_duration"][value="'+duration+'"]').checked=true;updateQuote();},{size,duration});
   const data=await p.evaluate(()=>{const q=activeQuote();return{q,rows:[...document.querySelectorAll('.price-row')].map(r=>r.innerText),text:document.getElementById('pricePanel').innerText,summary:document.getElementById('bookingSummary').innerText};});
   const total=Math.round(monthly*paid*(100-discount)/100);
   assert.equal(data.q.total,total,size+' '+duration+' '+language);assert.equal(data.q.deposit,monthly);assert.equal(data.q.atSigning,total+monthly);
   assert(data.rows.some(row=>row.includes(language==='en'?'1 month':'1 เดือน')&&row.includes(language==='en'?'Deposit':'เงินประกัน')));assert(!data.rows.some(row=>row.includes(language==='en'?'Due when you sign':'ชำระวันทำสัญญา')),'deposit is not added to the rent');
   assert(data.summary.includes(language==='en'?'Deposit 1 month':'เงินประกัน 1 เดือน'));assert(!data.summary.includes(language==='en'?'Due at signing':'ชำระวันทำสัญญา'));
   if(months>=6){assert(data.text.includes(language==='en'?'limited, first come first served':'จำนวนจำกัด'));assert(!data.text.includes(language==='en'?'30 rooms':'30 ห้อง'),'the room quota is never shown to customers');assert(data.text.includes(language==='en'?'14 days after opening':'14 วันหลังเปิดบริการ'));}
   if(duration==='over_12_months')assert(data.text.includes(language==='en'?'first 12 months':'12 เดือนแรก'));
  }
  await p.evaluate(()=>{document.querySelector('[name="requested_size"][value="4"]').checked=true;document.querySelector('[name="expected_duration"][value="12_months"]').checked=true;updateQuote();});
  for(const width of[390,1440]){await p.setViewportSize({width,height:1000});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:outputPath('promotion-terms-'+language+'-'+width+'.png'),fullPage:true});}
 }
 // Preserve historical data rather than rewriting prior quotes under current terms.
 await p.goto('http://127.0.0.1:8788/backoffice.html');
 const historical=await p.evaluate(()=>questionnaireFields({},{kind:'demand_validation_v2',payment_plan:'founding_12',quote_total:27930,quote_average_monthly:2328,deposit_amount:0}).find(([name])=>name==='Price shown for the plan')[1]);
 assert(historical.includes('deposit recorded ฿0'));assert(!historical.includes('no deposit'));
 console.log('PASS bilingual 90 size-duration renders; correct deposit/signing values, offer limits, first-year scope, 390/1440 layouts, historical quote display');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
