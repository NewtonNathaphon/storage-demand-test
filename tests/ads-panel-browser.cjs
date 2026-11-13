const assert=require('node:assert/strict');const {launchBrowser,outputPath}=require('./browser-runtime.cjs');
// Google Ads panel: monthly spend saved through /api/backoffice?resource=ad_spend, ad visits and enquiries by month, cost per reservation, CSV, and ad-click capture on the public pages.
(async()=>{const browser=await launchBrowser();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let spend=[{month:'2026-10-01',channel:'google_ads',amount_thb:1500,note:'receipt 1',updated_at:'2026-11-01T00:00:00Z',updated_by:'Owner'}],posted=null;
 await page.route('**/api/backoffice?**',route=>{const u=new URL(route.request().url());if(u.searchParams.get('resource')==='ad_spend'){if(route.request().method()==='POST'){posted=route.request().postDataJSON();spend=spend.filter(s=>s.month!==posted.month+'-01');spend.push({...posted,month:posted.month+'-01',updated_at:new Date().toISOString(),updated_by:'Owner'});return route.fulfill({contentType:'application/json',body:JSON.stringify([posted])});}return route.fulfill({contentType:'application/json',body:JSON.stringify(spend)});}return route.fulfill({contentType:'application/json',body:'[]'});});
 await page.goto('http://127.0.0.1:8788/backoffice.html',{waitUntil:'networkidle'});
 await page.evaluate(()=>{session={access_token:'test.token.value',expires_at:9999999999};$('dashboard').hidden=false;$('login').hidden=true;$('from').value='2026-10-01';$('through').value='2026-11-30';
  const reserve={kind:'demand_validation_v2',next_step:'reserve_free'},quote={kind:'demand_validation_v2',next_step:'quote_request'};
  rows=[{id:1,name:'Ad A',phone:'0812345678',created_at:'2026-10-10T05:00:00Z',utm_source:'google_ads',customer_use:JSON.stringify({...reserve,ad_click:{source:'google_ads',param:'gclid',click_id:'x',at:'2026-10-10T04:00:00Z'}})},
   {id:2,name:'Ad B',phone:'0812345679',created_at:'2026-10-12T05:00:00Z',utm_source:'google',customer_use:JSON.stringify(quote)},
   {id:3,name:'Ad C',phone:'0812345670',created_at:'2026-10-20T05:00:00Z',utm_source:'shared_form',customer_use:JSON.stringify({...reserve,ad_click:{source:'google_ads',param:'gclid',click_id:'y',at:'2026-10-19T04:00:00Z'}})},
   {id:4,name:'Direct D',phone:'0812345671',created_at:'2026-10-21T05:00:00Z',utm_source:'direct',customer_use:JSON.stringify(reserve)},
   {id:5,name:'TEST ADS',phone:'0000000000',created_at:'2026-10-22T05:00:00Z',utm_source:'google_ads',customer_use:JSON.stringify(reserve)},
   {id:6,name:'Ad Nov',phone:'0812345672',created_at:'2026-11-05T05:00:00Z',utm_source:'google_ads',customer_use:JSON.stringify(reserve)}];
  events=[{id:1,created_at:'2026-10-10T03:00:00Z',session_id:'s1',event_type:'page_view',utm_source:'google_ads'},{id:2,created_at:'2026-10-10T03:05:00Z',session_id:'s1',event_type:'page_view',utm_source:'google_ads'},{id:3,created_at:'2026-10-11T03:00:00Z',session_id:'s2',event_type:'page_view',utm_source:'google'},{id:4,created_at:'2026-10-11T03:00:00Z',session_id:'s3',event_type:'page_view',utm_source:'direct'},{id:5,created_at:'2026-11-02T03:00:00Z',session_id:'s4',event_type:'page_view',utm_source:'google_ads'}];
  render();});
 await page.evaluate(()=>loadAdSpend());
 const table=async()=>page.locator('#adRows tr').evaluateAll(trs=>trs.map(tr=>[...tr.children].map(td=>td.textContent)));
 let t=await table();assert.deepEqual(t[0],['2026-11','not entered','1','1','1','—','—'],'newest month first; no spend yet');
 assert.deepEqual(t[1],['2026-10','฿1,500','2','3','2','฿750','฿500'],'October: 2 ad sessions, 3 ad enquiries (test and direct excluded), 2 reservations');
 await page.locator('#adMonth').fill('2026-11');await page.locator('#adMonth').dispatchEvent('change');await page.locator('#adAmount').fill('900.5');await page.locator('#adNote').fill('Nov receipt');await page.locator('#adSave').click();
 await page.waitForFunction(()=>$('adStatus').textContent.startsWith('Saved'));assert.deepEqual(posted,{month:'2026-11',channel:'google_ads',amount_thb:900.5,note:'Nov receipt'});
 t=await table();assert.deepEqual(t[0],['2026-11','฿900.5','1','1','1','฿900.5','฿900.5']);
 await page.locator('#adMonth').fill('2026-10');await page.locator('#adMonth').dispatchEvent('change');assert.equal(await page.locator('#adAmount').inputValue(),'1500','choosing a saved month loads its spend for editing');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#adExport').click()]);const csv=require('node:fs').readFileSync(await download.path(),'utf8');assert(csv.includes('"2026-10","1500","2","3","2","750.00","500.00","receipt 1"'));
 const detail=await page.evaluate(()=>questionnaireFields(rows[2],safeDetails(rows[2])).find(([k])=>k==='Came from')?.[1]);assert.equal(detail,'Google Ads (ad click 19 Oct 2026, 11:00)','lead card shows the ad source even when the booking page had no tag');
 for(const width of [390,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#adsPanel').screenshot({path:outputPath('ads-panel-'+width+'.png')});}
 assert.deepEqual(errors,[]);
 // Public pages: a Google Ads click (gclid) marks the visit and the later booking as google_ads, kept 30 days in this browser only.
 const ctx=await browser.newContext(),pub=await ctx.newPage();await pub.route('**/*',r=>{const h=new URL(r.request().url()).hostname;if(h==='127.0.0.1')return r.continue();if(h.endsWith('supabase.co'))return r.fulfill({status:201,body:'[]'});return r.abort();});
 await pub.goto('http://127.0.0.1:8788/?gclid=TESTCLICK');assert.equal(await pub.evaluate(()=>source),'google_ads');
 await pub.goto('http://127.0.0.1:8788/register/');assert.equal(await pub.evaluate(()=>source),'google_ads','attribution carries to the booking page');
 await pub.goto('http://127.0.0.1:8788/register/?utm_source=facebook');assert.equal(await pub.evaluate(()=>source),'facebook','an explicit UTM tag wins');
 await pub.evaluate(()=>localStorage.setItem('sb_ad_click',JSON.stringify({source:'google_ads',param:'gclid',click_id:'old',at:new Date(Date.now()-31*864e5).toISOString()})));await pub.goto('http://127.0.0.1:8788/register/');assert.equal(await pub.evaluate(()=>source),'shared_form','clicks older than 30 days expire');
 console.log('PASS Google Ads panel: monthly spend save/edit, ad visits and enquiries by month, cost per reservation, CSV, layouts; gclid capture with 30-day expiry and UTM precedence');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
