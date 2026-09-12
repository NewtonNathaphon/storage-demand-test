const {chromium}=require(process.env.TEMP+'/storagebuddy-review-tools/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const page=await browser.newPage(),saved=[],errors=[];let fail=false;
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*.supabase.co/rest/v1/**',route=>{if(route.request().url().includes('/leads')){if(fail)return route.fulfill({status:500,body:'{}'});saved.push(route.request().postDataJSON());}return route.fulfill({status:201,body:'[]'});});
await page.goto('http://127.0.0.1:8788/?utm_source=setup_test_presale',{waitUntil:'networkidle'});
for(const language of ['th','en']){if(language==='en')await page.locator('#langBtn').click();for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:950});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+language+width);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:process.env.TEMP+'/storagebuddy-review-tools/presale-'+language+'-'+width+'.png'});}}
for(const offer of ['early_bird','founding_buddy']){
await page.locator('[data-presale="'+offer+'"]').click();assert.equal(await page.locator('#fOffer').inputValue(),offer);
await page.locator('#submitBtn').click();assert.equal(saved.length,offer==='early_bird'?0:1);
await page.locator('#fName').fill('TEST PRESALE');await page.locator('#fPhone').fill('0000000000');await page.locator('#fItems').fill('10 boxes and one sofa');await page.locator('#fSize').selectOption('4sqm');await page.locator('#fDuration').selectOption('6_12_months');await page.locator('#leadConsent').check();
fail=true;await page.locator('#submitBtn').click();await page.waitForFunction(()=>document.getElementById('leadMessage').textContent.includes('couldn'));assert.equal(await page.locator('#fItems').inputValue(),'10 boxes and one sofa');assert(await page.locator('#leadForm').isVisible());
fail=false;await page.locator('#submitBtn').click();await page.locator('#leadSuccess').waitFor({state:'visible'});const row=saved.at(-1),d=JSON.parse(row.customer_use);assert.equal(row.size,'4sqm');assert.equal(d.offer,offer);assert.equal(d.payment_status,'not_collected');assert.equal(d.commercial_terms_confirmed,false);assert.equal(d.kind,'presale_signup');assert.equal(d.discount_months,offer==='early_bird'?1:2);await page.locator('#leadSuccess button').click();
}
await page.locator('#offers').screenshot({path:process.env.TEMP+'/storagebuddy-review-tools/presale-offers.png'});
await page.route('**/api/estimate',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({min_sqm:2,max_sqm:3,items:['10 cardboard boxes'],questions:[],confidence:'medium',reasoning:'Allow room for access.'})}));
await page.locator('#photoInput').setInputFiles('C:/Users/User/storage-demand-test/assets/document_storage.webp');await page.locator('#aiResult').waitFor({state:'visible'});await page.locator('#aiResult button').click();await page.locator('#sizeCta').click();await page.locator('[data-presale="early_bird"]').click();await page.locator('#fName').fill('TEST PHOTO');await page.locator('#fPhone').fill('0000000000');await page.locator('#leadConsent').check();await page.locator('#submitBtn').click();await page.locator('#leadSuccess').waitFor({state:'visible'});assert.equal(JSON.parse(saved.at(-1).customer_use).ai_estimate.min_sqm,2);
assert.equal(errors.length,0,errors.join('\n'));console.log('PASS responsive TH/EN; both offers; saved preferences; failed-save recovery; unpaid status; no JS errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
