const assert=require('node:assert/strict');
const {launchBrowser}=require('./browser-runtime.cjs');

const origin='http://127.0.0.1:8788';
const query='utm_source=google&utm_medium=cpc&utm_campaign=rama3';
const queryObject={utm_source:'google',utm_medium:'cpc',utm_campaign:'rama3'};
const assertQuery=actual=>assert.deepEqual(Object.fromEntries(new URL(actual).searchParams),queryObject);

(async()=>{
  const browser=await launchBrowser();
  try{
    const page=await browser.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));

    await page.goto(`${origin}/?${query}`,{waitUntil:'networkidle'});
    await page.locator('#langBtn').click();
    await page.waitForURL(url=>url.pathname==='/en/');
    assertQuery(page.url());

    await page.goto(`${origin}/sizes/?${query}`,{waitUntil:'networkidle'});
    const lineHref=await page.locator('a[href^="https://line.me/"]').first().getAttribute('href');
    assert.equal(lineHref,'https://line.me/R/ti/p/%40storagebuddy','external LINE links must not receive campaign query parameters');
    await page.locator('a.language').click();
    await page.waitForURL(url=>url.pathname==='/en/sizes/');
    assertQuery(page.url());

    await page.goto(`${origin}/sizes/?${query}`,{waitUntil:'networkidle'});
    await page.locator('a[href^="/guides/choose-storage-size/"]').first().click();
    await page.waitForURL(url=>url.pathname==='/guides/choose-storage-size/');
    assertQuery(page.url());

    // Homepage size card opens the reservation form with the size and the campaign codes.
    await page.goto(`${origin}/?${query}`,{waitUntil:'networkidle'});
    await page.locator('#sizeGrid button',{hasText:/^7 /}).click();
    await page.locator('#sizeCta').click();
    await page.waitForURL(url=>url.pathname==='/register/');
    const reg=new URL(page.url());
    for(const [key,value] of Object.entries(queryObject))assert.equal(reg.searchParams.get(key),value,key);
    assert.equal(reg.searchParams.get('size'),'7');
    assert(await page.locator('[name="requested_size"][value="7"]').isChecked());

    assert.deepEqual(errors,[]);
    console.log('PASS UTM query survives language switches, guide links and the homepage size button into the reservation form; LINE stays unchanged');
  }finally{
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
