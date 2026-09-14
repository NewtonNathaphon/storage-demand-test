const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {launchBrowser}=require('./browser-runtime.cjs');

let origin;
const routes=[
 ['/guides/choose-storage-size/','th','/en/guides/choose-storage-size/'],
 ['/en/guides/choose-storage-size/','en','/guides/choose-storage-size/'],
 ['/guides/moving-renovation-checklist/','th','/en/guides/moving-renovation-checklist/'],
 ['/en/guides/moving-renovation-checklist/','en','/guides/moving-renovation-checklist/'],
 ['/guides/sme-stock-document-plan/','th','/en/guides/sme-stock-document-plan/'],
 ['/en/guides/sme-stock-document-plan/','en','/guides/sme-stock-document-plan/']
];
const query='utm_source=guide_test&utm_medium=organic&utm_campaign=visibility';
(async()=>{
 const root=path.join(__dirname,'..','public');
 const server=http.createServer((request,response)=>{let pathname=decodeURIComponent(request.url.split('?')[0]);const file=path.join(root,pathname,pathname.endsWith('/')?'index.html':'');fs.readFile(file,(error,body)=>{response.statusCode=error?404:200;response.end(error?'Not found':body);});});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 origin=`http://127.0.0.1:${server.address().port}`;
 let browser=null;
 try{
  browser=await launchBrowser();
  const page=await browser.newPage({viewport:{width:390,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  for(const [route,language,alternate] of routes){
   const response=await page.goto(`${origin}${route}?${query}`,{waitUntil:'networkidle'});
   assert.equal(response.status(),200,route);
   assert.equal(await page.locator('html').getAttribute('lang'),language,route);
   assert.equal(await page.locator('h1').count(),1,route);
   assert((await page.locator('main').innerText()).length>1200,route);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`horizontal overflow: ${route}`);
   const line=await page.locator('a[href^="https://line.me/"]').first().getAttribute('href');
   assert.equal(line,'https://line.me/R/ti/p/%40storagebuddy');
   await page.locator('a.language').click();
   await page.waitForURL(url=>url.pathname===alternate);
   assert.equal(new URL(page.url()).search,'?'+query);
  }
  for(const route of ['/','/en/']){
   await page.goto(`${origin}${route}?${query}`,{waitUntil:'networkidle'});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`horizontal overflow: ${route}`);
   const expected=route==='/en/'?['/en/guides/choose-storage-size/','/en/guides/moving-renovation-checklist/','/en/guides/sme-stock-document-plan/']:['/guides/choose-storage-size/','/guides/moving-renovation-checklist/','/guides/sme-stock-document-plan/'];
   for(const href of expected)assert.equal(await page.locator(`a[href^="${href}"]`).count()>0,true,`${route} needs ${href}`);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS 6 guides + home links: HTTP health, language, H1, console, 390px overflow, reciprocal switch and UTM retention');
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
