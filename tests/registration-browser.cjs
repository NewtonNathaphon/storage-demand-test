const assert=require('node:assert/strict');
const {launchBrowser,outputPath}=require('./browser-runtime.cjs');
(async()=>{const browser=await launchBrowser();try{
 const page=await browser.newPage(),saved=[],errors=[];let fail=true;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*.supabase.co/rest/v1/**',r=>{if(r.request().url().includes('/leads')){if(fail)return r.fulfill({status:500,body:'{}'});saved.push(r.request().postDataJSON());}return r.fulfill({status:201,body:'[]'});});
 await page.goto('http://127.0.0.1:8788/register/?utm_source=shared_test&utm_campaign=register',{waitUntil:'networkidle'});
 assert(await page.locator('#leadForm').isVisible());assert.equal(await page.locator('#size-help').count(),0);
 for(const width of [390,1440]){await page.setViewportSize({width,height:950});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:outputPath('registration-'+width+'.png'),fullPage:true});}
 await page.locator('#submitBtn').click();assert.equal(saved.length,0);
 await page.locator('#fCustomerType').selectOption('corporate');await page.locator('#fCompany').fill('TEST COMPANY');await page.locator('#fName').fill('TEST ONLY REGISTER');await page.locator('#fPhone').fill('0000000000');await page.locator('#fEmail').fill('test@example.com');await page.locator('#fItems').fill('10 boxes');await page.locator('#fSize').selectOption('larger');await page.locator('#fSqm').fill('12.5');await page.locator('#fOffer').selectOption('founding_buddy');await page.locator('#leadConsent').check();
 await page.locator('#langBtn').click();assert.equal(await page.locator('#fName').inputValue(),'TEST ONLY REGISTER');assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.locator('[data-privacy]').click();assert(await page.locator('#privacyDialog').isVisible());await page.locator('[data-close="privacyDialog"]').click();
 await page.locator('#submitBtn').click();await page.waitForFunction(()=>document.getElementById('leadMessage').textContent.includes('couldn'));assert(await page.locator('#leadForm').isVisible());assert.equal(await page.locator('#fItems').inputValue(),'10 boxes');
 fail=false;await page.locator('#submitBtn').click();await page.locator('#leadSuccess').waitFor({state:'visible'});assert.equal(saved.length,1);
 const row=saved[0],details=JSON.parse(row.customer_use);assert.equal(row.utm_source,'shared_test');assert.equal(details.entry_point,'standalone_registration');assert.equal(details.email,'test@example.com');assert.equal(details.requested_sqm,12.5);assert.equal(details.offer,'founding_buddy');assert.equal(details.payment_status,'not_collected');assert.equal(details.campaign.campaign,'register');assert.equal(details.language,'en');assert(await page.locator('#successLine').isVisible());
 await page.goto('http://127.0.0.1:8788/');assert((await page.locator('h1').innerText()).includes('คืนพื้นที่และความสุขให้คุณ'));assert.equal(await page.locator('.navlinks a').count(),3);assert(await page.locator('#size-help').isVisible());await page.screenshot({path:outputPath('homepage-restored.png')});
 assert.deepEqual(errors,[]);console.log('PASS separate form, desktop/mobile, retained fields on language change and failed save, saved payload, success, restored homepage');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
