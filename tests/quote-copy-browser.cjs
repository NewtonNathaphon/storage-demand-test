const assert=require('node:assert/strict');
const {launchBrowser}=require('./browser-runtime.cjs');
(async()=>{const browser=await launchBrowser();try{
 for(const size of ['over_10','unsure','unlisted']){
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  await page.route('**/*.supabase.co/rest/v1/**',r=>r.fulfill({status:201,body:'[]'}));
  await page.goto('http://127.0.0.1:8788/register/?lang=en');
  const pick=(name,value)=>page.locator(`[name="${name}"][value="${value}"]`).check();
  await pick('use_case','personal');await pick('requested_size',size==='unlisted'?'unsure':size);
  if(size==='unlisted')await page.evaluate(()=>{const choice=document.querySelector('[name="requested_size"][value="unsure"]');choice.value='3';choice.dispatchEvent(new Event('change',{bubbles:true}));});
  if(size==='over_10')await page.locator('#largeSqm').fill('20');
  await page.locator('#nextBtn').click();await pick('desired_move_in','now');await pick('expected_duration','3_months');
  assert((await page.locator('#nextBtn').innerText()).includes('Request my price'));
  await page.locator('#nextBtn').click();
  assert((await page.locator('#bookingSummary').innerText()).startsWith('Your price request:'));
  assert.equal(await page.locator('#submitBtn').innerText(),'Send price request');
  assert.equal(await page.locator('#contactQuestion').innerText(),'How should Buddy contact you about your price request?');assert((await page.locator('#lineContactHint').textContent()).includes('discuss your price request'));
  assert((await page.locator('#submissionNote').innerText()).includes('does not reserve a room'));
  await page.locator('#langBtn').click();assert.equal(await page.locator('#submitBtn').innerText(),'ส่งคำขอราคา');assert((await page.locator('#bookingSummary').innerText()).startsWith('คำขอราคาของคุณ:'));
  await page.locator('#langBtn').click();
  await pick('customer_type','individual');await pick('contact_preference','phone');await page.locator('#customerName').fill('TEST QUOTE COPY');await page.locator('#phone').fill('0000000000');await page.locator('#email').fill('test@example.com');await page.locator('#address').fill('TEST ADDRESS Bangkok');await page.locator('#consent').check();
  await page.locator('#submitBtn').click();await page.locator('#leadSuccess').waitFor({state:'visible'});
  assert.equal(await page.locator('#successTitle').innerText(),'Your price request is saved!');
  assert((await page.locator('#successStepContact').innerText()).includes('whether we can offer the size'));
  assert((await page.locator('#successStepAgreement').innerText()).includes('does not confirm a room reservation'));
  assert(!(await page.locator('#successSummary').innerText()).includes('Buddy will send your price'));
  await page.locator('#langBtn').click();assert.equal(await page.locator('#successTitle').innerText(),'บันทึกคำขอราคาของคุณแล้ว');assert((await page.locator('#successSummary').innerText()).includes('บัดดี้จะติดต่อเพื่อหารือเรื่องขนาดและราคา'));
  await page.locator('#langBtn').click();assert.equal(await page.locator('#successTitle').innerText(),'Your price request is saved!');
  const events=await page.evaluate(()=>window.dataLayer.filter(e=>e[0]==='event'&&e[1]==='conversion'));
  assert.equal(events.length,1);assert.equal(events[0][2].send_to,'AW-16778280533/aIXhCOD09LMdENX8wMA-');assert.deepEqual(errors,[]);await page.close();
 }
 const page=await browser.newPage();await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.goto('http://127.0.0.1:8788/register/?lang=en');await page.locator('[name="requested_size"][value="4"]').check();await page.evaluate(()=>{const input=document.querySelector('[name="expected_duration"][value="3_months"]');input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));});
 assert.equal(await page.locator('#submitBtn').textContent(),'Confirm free reservation');assert.equal(await page.locator('#successTitle').textContent(),'Your reservation is saved!');
 console.log('PASS quote request copy for large, unsure and unlisted sizes, Thai/English switches before and after save, quote-only events; reservation copy preserved');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
