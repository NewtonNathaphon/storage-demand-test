const {chromium}=require(process.env.TEMP+'/storagebuddy-review-tools/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:390,height:850}});let requests=0,failEstimate=true,failSave=true,saved=[];const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*.supabase.co/rest/v1/**',r=>{if(r.request().url().includes('/leads')){if(failSave)return r.fulfill({status:500,body:'{}'});saved.push(r.request().postDataJSON());}return r.fulfill({status:201,body:'[]'});});
 await page.route('**/api/estimate',r=>{requests++;return r.fulfill({status:failEstimate?503:200,contentType:'application/json',body:JSON.stringify(failEstimate?{code:'UNAVAILABLE'}:{min_sqm:2,max_sqm:3,items:['10 boxes'],questions:[],confidence:'medium',reasoning:'Space for boxes and access.'})});});
 await page.goto('http://127.0.0.1:8788/?utm_source=setup_test_size_gate',{waitUntil:'networkidle'});
 await page.locator('#itemDescription').fill('10 boxes and a suitcase');await page.locator('#estimateBtn').click();await page.waitForFunction(()=>!document.querySelector('#estimateBtn').disabled);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('sb_size_help_v1')||'{}').count||0),0);
 failEstimate=false;await page.locator('#estimateBtn').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sb_size_help_v1')||'{}').count===1);
 await page.locator('#itemDescription').fill('12 boxes and a suitcase');assert(await page.locator('#aiResult').isVisible());await page.locator('#estimateBtn').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sb_size_help_v1')||'{}').count===2);
 await page.locator('#itemDescription').fill('20 boxes and two suitcases');await page.locator('#estimateBtn').click();assert(await page.locator('#buddySignupDialog').isVisible());assert.equal(requests,3);
 await page.locator('#buddySignupDialog').screenshot({path:process.env.TEMP+'/storagebuddy-review-tools/size-gate-mobile.png'});
 await page.locator('#closeBuddySignup').click();assert(await page.locator('#aiResult').isVisible());await page.locator('#aiResult button').click();assert.equal(await page.locator('#fSize').inputValue(),'3sqm');
 await page.reload();await page.locator('#itemDescription').fill('20 boxes and two suitcases');await page.locator('#estimateBtn').click();assert(await page.locator('#buddySignupDialog').isVisible());assert.equal(requests,3);
 await page.locator('#buddyName').fill('TEST ONLY SIZE HELP');await page.locator('#buddyPhone').fill('0000000000');await page.locator('#buddyConsent').check();await page.locator('#buddySignupSubmit').click();await page.waitForFunction(()=>!document.querySelector('#buddySignupSubmit').disabled);assert(await page.locator('#buddySignupDialog').isVisible());assert.equal(requests,3);assert.equal(await page.locator('#buddyName').inputValue(),'TEST ONLY SIZE HELP');
 failSave=false;await page.locator('#buddySignupSubmit').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sb_size_help_v1')||'{}').count===3);assert.equal(requests,4);assert.equal(saved.length,1);const d=JSON.parse(saved[0].customer_use);assert.equal(d.kind,'size_help_signup');assert.equal(d.offer,undefined);assert(d.consent_at);assert.equal(d.items,'20 boxes and two suitcases');assert.equal(d.images,undefined);
 await page.reload();await page.locator('#itemDescription').fill('Another group of boxes');await page.locator('#estimateBtn').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sb_size_help_v1')||'{}').count===4);assert.equal(saved.length,1);
 assert.deepEqual(errors,[]);console.log('PASS free estimate + refinement; failed estimate not counted; gate persists; result accessible; failed save stays locked; successful lead save resumes; member remembered');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
