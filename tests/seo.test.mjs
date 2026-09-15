import {fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync, existsSync, readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const root=fileURLToPath(new URL('..',import.meta.url));
const built=spawnSync(process.execPath,['build.cjs'],{cwd:root,encoding:'utf8'});
assert.equal(built.status,0,built.stderr||built.stdout);

const pages={
  '/':'index.html',
  '/en/':'en/index.html',
  '/sizes/':'sizes/index.html',
  '/en/sizes/':'en/sizes/index.html',
  '/location/rama-3/':'location/rama-3/index.html',
  '/en/location/rama-3/':'en/location/rama-3/index.html',
  '/personal-storage/':'personal-storage/index.html',
  '/en/personal-storage/':'en/personal-storage/index.html',
  '/business-storage/':'business-storage/index.html',
  '/en/business-storage/':'en/business-storage/index.html',
  '/guides/choose-storage-size/':'guides/choose-storage-size/index.html',
  '/en/guides/choose-storage-size/':'en/guides/choose-storage-size/index.html',
  '/guides/moving-renovation-checklist/':'guides/moving-renovation-checklist/index.html',
  '/en/guides/moving-renovation-checklist/':'en/guides/moving-renovation-checklist/index.html',
  '/guides/sme-stock-document-plan/':'guides/sme-stock-document-plan/index.html',
  '/en/guides/sme-stock-document-plan/':'en/guides/sme-stock-document-plan/index.html'
};
const html=Object.fromEntries(Object.entries(pages).map(([url,file])=>[url,readFileSync(join(root,'public',file),'utf8')]));
const one=(source,re,label)=>{const matches=[...source.matchAll(re)];assert.equal(matches.length,1,label);return matches[0][1].replace(/<[^>]+>/g,'').trim();};
const attr=(source,tag,name)=>one(source,new RegExp(`<${tag}[^>]*\\b${name}=["']([^"']+)["'][^>]*>`,'gi'),`one ${tag} ${name}`);
const visibleText=source=>source
  .replace(/<(script|style|svg|template)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
  .replace(/<!--([\s\S]*?)-->/g,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/&(?:nbsp|amp|quot|#39);/g,' ')
  .replace(/\s+/g,' ')
  .trim();

for(const [url,source] of Object.entries(html)){
  test(`${url} has unique indexable metadata`,()=>{
    assert.equal(one(source,/<title>([^<]+)<\/title>/gi,'one title').length>10,true);
    assert.equal(one(source,/<h1[^>]*>([\s\S]*?)<\/h1>/gi,'one H1').length>8,true);
    assert.equal(one(source,/<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/gi,'one description').length>40,true);
    assert.equal(one(source,/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/gi,'one canonical').startsWith('https://'),true);
    assert.equal(attr(source,'html','lang'),url.startsWith('/en')?'en':'th');
    for(const lang of ['th-TH','en-TH','x-default'])assert.match(source,new RegExp(`<link[^>]+hreflang=["']${lang}["']`,'i'));
  });
}

test('titles, H1s and canonicals are unique and canonical',()=>{
  for(const re of [/<title>([^<]+)<\/title>/gi,/<h1[^>]*>([\s\S]*?)<\/h1>/gi,/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/gi]){
    const values=Object.values(html).map(source=>one(source,re,'single SEO field').replace(/<[^>]+>/g,'').trim());
    assert.equal(new Set(values).size,values.length,`duplicates: ${values.join(' | ')}`);
  }
  for(const [url,source] of Object.entries(html))assert.match(source,new RegExp(`rel=["']canonical["'][^>]+href=["']https://storagebuddyth\\.com${url.replaceAll('/','\\/')}`,'i'));
});

test('hreflang and Open Graph URLs are exact across all canonical pairs',()=>{
  const reciprocalPairs=[
    ['/','/en/'],['/sizes/','/en/sizes/'],['/location/rama-3/','/en/location/rama-3/'],
    ['/personal-storage/','/en/personal-storage/'],['/business-storage/','/en/business-storage/'],
    ['/guides/choose-storage-size/','/en/guides/choose-storage-size/'],
    ['/guides/moving-renovation-checklist/','/en/guides/moving-renovation-checklist/'],
    ['/guides/sme-stock-document-plan/','/en/guides/sme-stock-document-plan/']
  ];
  const alternate=(source,language)=>one(source,new RegExp(`<link[^>]+rel=["']alternate["'][^>]+hreflang=["']${language}["'][^>]+href=["']([^"']+)["']`,'gi'),language);
  for(const [thai,english] of reciprocalPairs){
    for(const url of [thai,english]){
      assert.equal(alternate(html[url],'th-TH'),'https://storagebuddyth.com'+thai);
      assert.equal(alternate(html[url],'en-TH'),'https://storagebuddyth.com'+english);
      assert.equal(alternate(html[url],'x-default'),'https://storagebuddyth.com'+thai);
      assert.equal(one(html[url],/<meta property=["']og:url["'] content=["']([^"']+)["'][^>]*>/gi,'one og:url'),'https://storagebuddyth.com'+url);
      for(const property of ['og:title','og:description','og:image'])assert.match(html[url],new RegExp(`<meta property=["']${property}["'] content=["'][^"']+["']`,'i'));
    }
  }
});

test('homepage language URLs and path-first English initialization are explicit',()=>{
  assert.match(html['/'],/ห้องเก็บของให้เช่า พระราม 3/);
  assert.match(html['/'],/hreflang=["']en-TH["'][^>]*href=["']https:\/\/storagebuddyth\.com\/en\//i);
  assert.match(html['/en/'],/<title>Self Storage Rama 3, Bangkok \| StorageBuddy<\/title>/);
  assert.match(html['/en/'],/const pathLanguage='en'|data-page-language=["']en["']/);
  assert.match(html['/'],/location\.href=withCurrentQuery\(lang==='th'\?'\/en\/':'\/'\)/);
  assert.match(html['/en/'],/<meta property="og:image" content="https:\/\/storagebuddyth\.com\/assets\/buddy_banner_en\.webp">/);
});

test('campaign query survives every same-origin internal navigation path',()=>{
  for(const [url,source] of Object.entries(html)){
    assert.match(source,/function withCurrentQuery\(href\)/,`${url} needs a query-preserving URL helper`);
    assert.match(source,/location\.search/,`${url} must read the incoming query`);
    assert.match(source,/querySelectorAll\(['"]a\[href\]['"]\)/,`${url} must preserve attribution on internal links`);
  }
  for(const source of [html['/sizes/'],html['/en/sizes/']]){
    assert.match(source,/#size-help/);
    assert.match(source,/#contact/);
  }
  for(const [thai,english] of [
    ['/sizes/','/en/sizes/'],
    ['/location/rama-3/','/en/location/rama-3/'],
    ['/personal-storage/','/en/personal-storage/'],
    ['/business-storage/','/en/business-storage/']
  ]){
    assert.match(html[thai],new RegExp(`<a class=["']language["'] href=["']${english.replaceAll('/','\\/')}["']`));
    assert.match(html[english],new RegExp(`<a class=["']language["'] href=["']${thai.replaceAll('/','\\/')}["']`));
  }
});

test('homepage English source has crawlable English visible text',()=>{
  const text=visibleText(html['/en/']);
  const intentionalThaiTokens=['สตอเรจบัดดี้','ไทย'];
  const unexpectedThai=intentionalThaiTokens.reduce((value,token)=>value.replaceAll(token,''),text).match(/[ก-๙]+/g)||[];
  assert.deepEqual(unexpectedThai,[],`unexpected Thai visible text: ${[...new Set(unexpectedThai)].join(' | ')}`);
  const placeholders=[...html['/en/'].matchAll(/\bplaceholder=["']([^"']*)["']/gi)].map(match=>match[1]);
  assert.equal(placeholders.some(value=>/[ก-๙]/.test(value)),false,`unexpected Thai placeholder: ${placeholders.join(' | ')}`);
  for(const phrase of ['Size guide','Check pricing and tell us your start date','welcoming its first customers in Rama 3','Your privacy','Website operator and data controller'])assert.match(text,new RegExp(phrase,'i'));
});

test('homepage English source materializes accessibility localization without client JavaScript',()=>{
  const source=html['/en/'];
  const langButton=source.match(/<button\b[^>]*\bid=["']langBtn["'][^>]*>([\s\S]*?)<\/button>/i);
  assert.ok(langButton,'language button required');
  assert.equal(langButton[1].replace(/<[^>]+>/g,'').trim(),'🌐 ไทย');
  assert.match(langButton[0],/\baria-label=["']Switch to Thai["']/i);

  const translatedImages=[...source.matchAll(/<img\b[^>]*\balt=["']([^"']*)["'][^>]*\bdata-en-alt=["']([^"']*)["'][^>]*>/gi)];
  assert.ok(translatedImages.length,'at least one localized image alt required');
  for(const [,alt,englishAlt] of translatedImages)assert.equal(alt,englishAlt);
  assert.match(source,/<svg\b[^>]*\bid=["']roomIllustration["'][^>]*\baria-label=["']Illustrative storage room["']/i);

  const accessibilityText=[...source.matchAll(/\b(?:alt|aria-label)=["']([^"']*)["']/gi)].map(match=>match[1].replaceAll('สตอเรจบัดดี้',''));
  assert.equal(accessibilityText.some(value=>/[ก-๙]/.test(value)),false,`unexpected Thai accessibility text: ${accessibilityText.filter(value=>/[ก-๙]/.test(value)).join(' | ')}`);
});

test('commercial pages cover useful search intent without pretending to be open',()=>{
  assert.match(html['/'],/พื้นที่เก็บของรายเดือน/);
  assert.match(html['/'],/ย่านพระราม 3/i);
  assert.match(html['/location/rama-3/'],/เช่าที่เก็บของ พระราม 3/);
  assert.match(html['/sizes/'],/ห้องเก็บของรายเดือน พระราม 3/);
  assert.match(html['/business-storage/'],/โกดังขนาดเล็กให้เช่า/);
  assert.match(html['/sizes/'],/1 ตร\.ม\.[\s\S]*2 ตร\.ม\.[\s\S]*3 ตร\.ม\.[\s\S]*4 ตร\.ม\.[\s\S]*5 ตร\.ม\.[\s\S]*8 ตร\.ม\./);
  assert.match(html['/en/sizes/'],/1 sqm[\s\S]*2 sqm[\s\S]*3 sqm[\s\S]*4 sqm[\s\S]*5 sqm[\s\S]*8 sqm/i);
  assert.match(html['/location/rama-3/'],/HomePro พระราม 3[\s\S]*สาธุประดิษฐ์[\s\S]*ยานนาวา[\s\S]*บางคอแหลม[\s\S]*สาทร/);
  assert.match(html['/en/location/rama-3/'],/HomePro Rama 3[\s\S]*Sathu Pradit[\s\S]*Yan Nawa[\s\S]*Bang Kho Laem[\s\S]*Sathorn/i);
  assert.match(html['/personal-storage/'],/คอนโด[\s\S]*ย้ายบ้าน[\s\S]*รีโนเวท[\s\S]*เฟอร์นิเจอร์/);
  assert.match(html['/business-storage/'],/สต็อก[\s\S]*เอกสาร[\s\S]*ไม่ใช่โกดังโลจิสติกส์/);
  assert.match(html['/en/business-storage/'],/inventory[\s\S]*documents[\s\S]*not a full logistics warehouse/i);
  for(const source of Object.values(html)){
    assert.doesNotMatch(source,/24\s*\/\s*7|CCTV|air[- ]?condition|ประกันภัย|พร้อมเข้าใช้|เปิดให้บริการแล้ว|available (?:now|today)|exact facility address|ราคาเริ่ม|starting (?:at|from)|฿\s*\d/i);
  }
});

test('guides are substantial, reciprocal and connected to useful next steps',()=>{
  const guidePairs=[
    ['/guides/choose-storage-size/','/en/guides/choose-storage-size/','/sizes/','/en/sizes/'],
    ['/guides/moving-renovation-checklist/','/en/guides/moving-renovation-checklist/','/personal-storage/','/en/personal-storage/'],
    ['/guides/sme-stock-document-plan/','/en/guides/sme-stock-document-plan/','/business-storage/','/en/business-storage/']
  ];
  for(const [thai,english,thaiOverview,englishOverview] of guidePairs){
    assert.ok(visibleText(html[thai]).length>1800,`${thai} is too thin`);
    assert.ok(visibleText(html[english]).split(/\s+/).length>=800,`${english} needs at least 800 useful words`);
    for(const [url,alternate,overview] of [[thai,english,thaiOverview],[english,thai,englishOverview]]){
      const source=html[url];
      assert.match(source,new RegExp(`class=["']language["'][^>]+href=["']${alternate.replaceAll('/','\\/')}["']`));
      assert.match(source,new RegExp(`href=["']${overview.replaceAll('/','\\/')}["']`));
      assert.match(source,/<nav[^>]+aria-label=["'][^"']*(?:breadcrumb|เส้นทาง)[^"']*["'][^>]*>/i);
      assert.match(source,/<(?:ol|ul)\b[\s\S]*?<li\b/i);
      for(const [otherThai,otherEnglish] of guidePairs){
        const related=url.startsWith('/en/')?otherEnglish:otherThai;
        assert.match(source,new RegExp(`href=["']${related.replaceAll('/','\\/')}["']`),`${url} must link ${related}`);
      }
      assert.match(source,/#size-help/);assert.match(source,/#contact/);
      assert.match(source,/https:\/\/line\.me\/R\/ti\/p\/%40storagebuddy/);
    }
  }
  for(const source of [html['/guides/choose-storage-size/'],html['/en/guides/choose-storage-size/']]){
    assert.match(source,/<table\b[\s\S]*?<th\b/i);
    assert.match(source,/L\s*[×x]\s*W\s*[×x]\s*H|กว้าง\s*[×x]\s*ยาว\s*[×x]\s*สูง/i);
    assert.match(source,/footprint|พื้นที่ฐาน/i);assert.match(source,/volume|ปริมาตร/i);assert.match(source,/stack|ซ้อน/i);assert.match(source,/aisle|ทางเดิน/i);assert.match(source,/photo|รูป/i);assert.match(source,/illustrative|ตัวอย่าง/i);assert.match(source,/not (?:a )?(?:fit )?guarantee|ไม่รับประกัน/i);
  }
  for(const source of [html['/guides/moving-renovation-checklist/'],html['/en/guides/moving-renovation-checklist/']]){
    assert.match(source,/before[\s\S]*during[\s\S]*after|ก่อน[\s\S]*ระหว่าง[\s\S]*หลัง/i);assert.match(source,/keep[\s\S]*donate[\s\S]*store|เก็บไว้ใช้[\s\S]*บริจาค[\s\S]*ฝากเก็บ/i);assert.match(source,/doorway|ประตู/i);assert.match(source,/fragile|เปราะบาง/i);assert.match(source,/retrieval|หยิบ/i);assert.match(source,/<table\b/i);assert.match(source,/print|พิมพ์/i);
  }
  const movingWorkedExamples=[
    ['/guides/moving-renovation-checklist/',/ตัวอย่างสมมติแบบทำครบขั้นตอน[\s\S]*สี่กลุ่ม[\s\S]*ก่อนเคลียร์พื้นที่[\s\S]*ติดป้าย[\s\S]*โซน A[\s\S]*หยิบ[\s\S]*ปิดรายการ/],
    ['/en/guides/moving-renovation-checklist/',/Hypothetical worked example from sorting to closeout[\s\S]*four groups[\s\S]*before clear-out[\s\S]*label[\s\S]*Zone A[\s\S]*retriev[\s\S]*closeout/i]
  ];
  for(const [url,workflow] of movingWorkedExamples){
    assert.match(visibleText(html[url]),workflow,`${url} needs a visible end-to-end hypothetical worked example`);
  }
  for(const source of [html['/guides/sme-stock-document-plan/'],html['/en/guides/sme-stock-document-plan/']]){
    assert.match(source,/SKU/i);assert.match(source,/fast[\s\S]*slow|หมุนเร็ว[\s\S]*หมุนช้า/i);assert.match(source,/cycle.?count|ตรวจนับ/i);assert.match(source,/legal advice|คำแนะนำทางกฎหมาย/i);assert.match(source,/fulfillment|ฟูลฟิลเมนต์/i);assert.match(source,/courier|ขนส่ง/i);assert.match(source,/<table\b[\s\S]*?<table\b/i);assert.match(source,/fictional|สมมติ/i);
  }
  for(const source of Object.entries(html).filter(([url])=>url.includes('/guides/')).map(([,source])=>source)){
    assert.match(source,/<section[^>]*class=["'][^"']*faq|FAQ|คำถามที่พบบ่อย/i);
    assert.match(source,/href=["'](?:\/en)?\/location\/rama-3\//);
  }
  for(const source of Object.values(html))assert.doesNotMatch(source,/moving-renovation-storage|sme-inventory-storage/);
});

test('navigation exposes the guide entry without creating a guides hub',()=>{
  assert.match(html['/'],/href=["']\/register\/["']/);
  assert.match(html['/en/'],/href=["']\/register\/\?lang=en["']/);
  for(const [url,source] of Object.entries(html).filter(([url])=>url!=='/'&&url!=='/en/')){
    const guide=url.startsWith('/en/')?'/en/guides/choose-storage-size/':'/guides/choose-storage-size/';
    assert.match(source,new RegExp(`<nav[^>]*>[\\s\\S]*href=["']${guide.replaceAll('/','\\/')}["']`),`${url} nav needs guide link`);
  }
  assert.equal(existsSync(join(root,'public','guides','index.html')),false);
  assert.equal(existsSync(join(root,'public','en','guides','index.html')),false);
  for(const source of Object.values(html))assert.doesNotMatch(source,/hreflang=["'](?:zh|hi|ar|de|fr)(?:-|["'])/i);
});

test('homepage and contextual pages link to the relevant guides',()=>{
  const expected={
    '/':['/guides/choose-storage-size/','/guides/moving-renovation-checklist/','/guides/sme-stock-document-plan/'],
    '/en/':['/en/guides/choose-storage-size/','/en/guides/moving-renovation-checklist/','/en/guides/sme-stock-document-plan/'],
    '/sizes/':['/guides/choose-storage-size/'],'/en/sizes/':['/en/guides/choose-storage-size/'],
    '/personal-storage/':['/guides/moving-renovation-checklist/'],'/en/personal-storage/':['/en/guides/moving-renovation-checklist/'],
    '/business-storage/':['/guides/sme-stock-document-plan/'],'/en/business-storage/':['/en/guides/sme-stock-document-plan/']
  };
  for(const [url,links] of Object.entries(expected))for(const link of links)assert.match(html[url],new RegExp(`href=["']${link.replaceAll('/','\\/')}["']`),`${url} needs ${link}`);
});

test('homepage public copy is enquiry-led and makes no unsupported booking or benefit claims',()=>{
  for(const url of ['/','/en/']){
    const text=visibleText(html[url]);
    assert.doesNotMatch(text,/Enjoy special benefits when you book|รับสิทธิพิเศษเมื่อจอง|Choose your special offer|เลือกโปรสุดคุ้ม/i);
    assert.doesNotMatch(text,/Choose your opening offer|เลือกข้อเสนอเปิดบริการ|Founding Buddy reservation offer|ข้อเสนอจองล่วงหน้า/i);
    assert.doesNotMatch(text,/best value for you|คุ้มค่าที่สุด|Confirm your details and start date to become a Buddy|ยืนยันข้อมูลและวันที่ เพื่อเริ่มเป็นบัดดี้/i);
    assert.doesNotMatch(text,/next steps shortly|ขั้นตอนต่อไปให้เร็ว ๆ นี้/i);
    assert.match(text,/No payment or deposit at this stage|ไม่มีการเรียกเก็บเงินหรือค่ามัดจำ/i);
  }
});

test('schema uses the approved phone and no facility schema or address',()=>{
  for(const source of Object.values(html)){
    const blocks=[...source.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
    assert.ok(blocks.length,'JSON-LD required');
    const data=blocks.map(m=>JSON.parse(m[1])).flat();
    const org=data.find(x=>x['@type']==='Organization');
    assert.ok(org,'Organization schema required');
    assert.equal(org.telephone,'+66-62-879-3645');
    assert.equal('address' in org,false,'registered address must not be presented as facility schema');
    assert.equal(data.some(x=>/LocalBusiness|SelfStorage|StorageFacility/.test(String(x['@type']))),false);
  }
});

test('redirects permanently retire duplicate rooms URLs',()=>{
  const redirects=readFileSync(join(root,'public','_redirects'),'utf8');
  assert.match(redirects,/^\/rooms\s+\/sizes\/\s+301$/m);
  assert.match(redirects,/^\/rooms\/\s+\/sizes\/\s+301$/m);
  assert.match(redirects,/^\/en\/rooms\s+\/en\/sizes\/\s+301$/m);
  assert.equal(existsSync(join(root,'public','rooms.html')),false);
});

test('sitemap lists only built canonical URLs with alternates and consistent ISO lastmod values',()=>{
  const sitemap=readFileSync(join(root,'public','sitemap.xml'),'utf8');
  assert.doesNotMatch(sitemap,/\/rooms\/?</);
  const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.equal(locs.length,16);
  assert.deepEqual(locs,Object.keys(pages).map(url=>'https://storagebuddyth.com'+url));
  assert.equal(locs.includes('https://storagebuddyth.com/404.html'),false);
  const lastmods=[...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match=>match[1]);
  assert.equal(lastmods.length,locs.length);
  assert.equal(new Set(lastmods).size,1,`inconsistent lastmod values: ${lastmods.join(' | ')}`);
  assert.match(lastmods[0],/^\d{4}-\d{2}-\d{2}$/);
  assert.equal(Number.isNaN(Date.parse(`${lastmods[0]}T00:00:00Z`)),false);
  assert.match(sitemap,/xmlns:xhtml=/);
  for(const [url,source] of Object.entries(html)){
    const block=sitemap.match(new RegExp(`<url><loc>https://storagebuddyth\\.com${url.replaceAll('/','\\/')}<\\/loc>([\\s\\S]*?)<\\/url>`));
    assert.ok(block,`missing sitemap block for ${url}`);
    for(const language of ['th-TH','en-TH','x-default']){
      const expected=one(source,new RegExp(`<link[^>]+hreflang=["']${language}["'][^>]+href=["']([^"']+)["']`,'gi'),`${url} ${language}`);
      assert.match(block[1],new RegExp(`hreflang=["']${language}["'][^>]+href=["']${expected.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']`));
    }
  }
  for(const url of Object.keys(pages))assert.ok(existsSync(join(root,'public',pages[url])),`missing built file for ${url}`);
});

test('build allowlist excludes internal documents and SQL while retaining conversion hooks',()=>{
  const walk=dir=>readdirSync(dir).flatMap(name=>{const file=join(dir,name);return statSync(file).isDirectory()?walk(file):[file];});
  const output=walk(join(root,'public')).map(file=>relative(join(root,'public'),file));
  assert.equal(output.some(file=>/\.(?:md|sql|csv)$/i.test(file)),false,output.join('\n'));
  assert.equal(output.some(file=>/SEO_PLAN|HANDOFF|BRIEF|RESEARCH/i.test(file)),false);
  for(const id of ['buddySignupDialog','buddySignupForm','estimateBtn','sizeGrid'])assert.match(html['/'],new RegExp(`id=["']${id}["']`));
  const questionnaire=readFileSync(join(root,'public','register/index.html'),'utf8');for(const id of ['demandForm','customerName','phone','itemDescription','submitBtn'])assert.match(questionnaire,new RegExp(`id=["']${id}["']`));
  assert.match(readFileSync(join(root,'public','backoffice.html'),'utf8'),/<meta name=["']robots["'] content=["']noindex,nofollow["']>/i);
});
