// Shareable price list at /price/. Prices come only from demand-config.cjs (Newton-approved).
// Kept out of the sitemap and noindex for now: the indexed SEO pages stay price-free before opening.
const config=require('./demand-config.cjs');
const LINE='https://line.me/R/ti/p/%40storagebuddy'; // exact URL the Google Ads LINE conversion listens for
const OPEN_TH='คาดเปิดต้นปี 2570 โดยกำหนดการอาจเปลี่ยนตามความคืบหน้าการก่อสร้าง';
const OPEN_EN='Expected to open in early 2027; timing may change depending on construction progress.';
const tr=(th,en)=>`<span data-en="${en}">${th}</span>`;
const money=n=>'฿'+n.toLocaleString('en-US');
// Illustrative guidance only, in the same hedged wording as the size guide.
const FITS={
 locker:['สำหรับกระเป๋า กล่อง เอกสาร หรือของชิ้นเล็ก ราคาต่อช่อง (ช่องบนหรือช่องล่าง)','For bags, boxes, documents or small items. Price per box (upper or lower).'],
 2:['ตัวอย่างสำหรับกล่องเอกสาร หนังสือ กระเป๋า และของตามฤดูกาลที่แพ็กซ้อนได้','An example for archive boxes, books, luggage and stackable seasonal belongings.'],
 4:['อาจเหมาะกับจักรยาน อุปกรณ์กีฬา และกล่องหลายใบ เมื่อเผื่อพื้นที่ทางเดินแล้ว','May suit a bicycle, sports equipment and several boxes after allowing an access path.'],
 5:['แนวทางสำหรับของจากคอนโดหลายชิ้นรวมเฟอร์นิเจอร์ชิ้นเล็ก','Guidance for mixed condo belongings with a few small furniture pieces.'],
 6:['ตัวอย่างโซฟา 2 ที่นั่ง ชั้นวางเล็ก กระเป๋าเดินทาง 2 ใบ และกล่อง 8 ใบ ระหว่างย้ายบ้านหรือรีโนเวท','An example with a two-seat sofa, small shelf, 2 suitcases and 8 boxes during a move or renovation.'],
 7:['แนวทางสำหรับเฟอร์นิเจอร์หลายชิ้น หรืออุปกรณ์ร้านค้าที่ซ้อนเก็บได้','Guidance for several furniture pieces or stackable shop equipment.'],
 8:['ตัวอย่างสำหรับของหลายประเภท เฟอร์นิเจอร์หลายชิ้น หรือสต็อกธุรกิจขนาดย่อม','An example for mixed belongings, several furniture pieces or small business stock.'],
 9:['แนวทางสำหรับของจากบ้านหลายห้อง หรือสต็อกและอุปกรณ์ธุรกิจ','Guidance for belongings from several rooms, or business stock and equipment.'],
 10:['แนวทางสำหรับของจากบ้านหลายห้อง เฟอร์นิเจอร์ชิ้นใหญ่ หรือสต็อกธุรกิจ','Guidance for several rooms of belongings, large furniture or business stock.']
};
const card=(key,sqm,monthly)=>{
 const locker=key==='locker',[fitTh,fitEn]=FITS[key];
 return `<button type="button" class="price-card" data-size="${locker?'':sqm}" data-label-th="${locker?'ล็อกเกอร์ 1 ช่อง':sqm+' ตร.ม.'}" data-label-en="${locker?'1 locker box':sqm+' sqm'}" data-price="${monthly}" aria-pressed="false">
  <span class="size">${locker?tr('ล็อกเกอร์','Locker'):`${sqm} <small>${tr('ตร.ม.','sqm')}</small>`}</span>
  <span class="amount">${money(monthly)}<small>${tr('/เดือน','/month')}</small></span>
  ${locker?'':`<span class="per">${tr('≈ '+money(Math.round(monthly/sqm))+'/ตร.ม.','≈ '+money(Math.round(monthly/sqm))+'/sqm')}</span>`}
  <span class="fit">${tr(fitTh,fitEn)}</span></button>`;
};
const faq=[
 ['ต้องจ่ายเงินตอนนี้ไหม?','Do I need to pay now?','ยังไม่ต้อง ขั้นตอนนี้เป็นการแจ้งความสนใจ ไม่มีการเรียกเก็บเงินหรือค่ามัดจำ','Not yet. This step only registers interest; there is no payment or deposit.'],
 ['ไม่แน่ใจว่าต้องใช้ขนาดไหน?','Not sure which size you need?','ส่งรูปหรือรายการของมาทาง LINE บัดดี้ช่วยประเมินขนาดให้ฟรี หรือดูคู่มือขนาดห้อง','Send photos or a list on LINE and Buddy will estimate the size for free, or read the size guide.'],
 ['เปิดให้บริการเมื่อไหร่?','When do you open?',OPEN_TH,OPEN_EN],
 ['เช่าหลายห้อง หรือเช่าในนามบริษัทได้ไหม?','Can I rent several rooms or rent as a company?','ได้ สอบถามห้องที่อยู่ใกล้กันและเอกสารที่ต้องใช้ทาง LINE @storagebuddy','Yes. Ask on LINE @storagebuddy about rooms next to each other and the documents needed.']
];
function renderPricePage(){
 const rooms=config.rooms.map(r=>card(r.sqm,r.sqm,r.monthly)).join('');
 const locker=card('locker',config.locker.sqm,config.locker.monthly);
 const low=Math.min(config.locker.monthly,...config.rooms.map(r=>r.monthly)),high=Math.max(...config.rooms.map(r=>r.monthly));
 const desc=`ห้องเก็บของรายเดือน StorageBuddy พระราม 3 ขนาด ${config.rooms[0].sqm}–${config.rooms.at(-1).sqm} ตร.ม. และล็อกเกอร์ ราคา ${money(low)}–${money(high)} ต่อเดือน`;
 return `<!doctype html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ราคาห้องเก็บของ พระราม 3 | StorageBuddy</title><meta name="description" content="${desc}"><meta name="robots" content="noindex,follow">
<meta property="og:type" content="website"><meta property="og:site_name" content="StorageBuddy สตอเรจบัดดี้"><meta property="og:title" content="ราคาห้องเก็บของ StorageBuddy พระราม 3"><meta property="og:description" content="${desc}"><meta property="og:url" content="https://storagebuddyth.com/price/"><meta property="og:image" content="https://storagebuddyth.com/assets/storagebuddy_banner.webp">
<link rel="icon" href="/assets/storagebuddy_logo_20260912.png"><link rel="stylesheet" href="/assets/seo-pages.css">
<style>
.price-top{display:flex;align-items:center;gap:1rem;margin-left:auto}.price-top a{font-weight:650;text-decoration:none}.line-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 1.2rem;border-radius:999px;background:#06c755;color:#fff!important;font-weight:750;text-decoration:none}
main section.price-hero,main section.price-section{background:none!important;border:0!important;padding:0!important;border-radius:0}main section.price-hero{padding:2.2rem 0 1.2rem!important;max-width:820px}.price-hero h1{font-size:clamp(2rem,5.5vw,3.4rem);line-height:1.2;letter-spacing:-.03em;margin:.5rem 0 1rem}
.price-note{background:var(--sky);border-radius:14px;padding:.9rem 1.1rem;margin:0 0 1.5rem;font-size:.95rem}
.price-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;margin:0 0 1rem}
.price-card{display:flex;flex-direction:column;gap:.35rem;text-align:left;font:inherit;color:inherit;background:#fff;border:2px solid var(--line);border-radius:18px;padding:1.1rem 1.2rem;cursor:pointer;min-height:44px}
.price-card:hover{border-color:var(--green)}.price-card[aria-pressed="true"]{border-color:var(--green);box-shadow:0 0 0 3px rgba(7,131,93,.18)}
.price-card .size{font-size:1.5rem;font-weight:800;color:var(--dark);line-height:1.1}.price-card .size small{font-size:1rem;font-weight:700}
.price-card .amount{font-size:1.65rem;font-weight:800;color:var(--green);line-height:1.2}.price-card .amount small{font-size:.95rem;font-weight:600;color:var(--muted);white-space:nowrap}
.price-card .per{font-size:.85rem;color:var(--muted)}.price-card .fit{font-size:.92rem;line-height:1.55}
.price-section{margin:2.2rem 0}.price-section h2{font-size:1.5rem;margin:0 0 .8rem}
.promo-box{background:#fff;border:2px dashed var(--green);border-radius:18px;padding:1.1rem 1.2rem;display:flex;flex-wrap:wrap;gap:.8rem 1.2rem;align-items:center;justify-content:space-between}
.faq details{background:#fff;border:1px solid var(--line);border-radius:14px;padding:.85rem 1.1rem;margin-bottom:.6rem}.faq summary{font-weight:700;cursor:pointer;min-height:28px}
.pick-bar{position:sticky;bottom:0;z-index:5;background:#fff;border-top:1px solid var(--line);box-shadow:0 -6px 18px rgba(18,60,80,.08);padding:.7rem max(1rem,calc((100% - 1120px)/2));display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1rem}
.pick-bar .chosen-wrap{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.35}.pick-bar .chosen{font-weight:750}.pick-bar .alt{font-weight:700;font-size:.9rem;min-height:32px;display:inline-flex;align-items:center}
@media (max-width:560px){.price-top{gap:.8rem}.price-grid{grid-template-columns:1fr 1fr;gap:10px}.price-card{padding:.9rem}.price-card .size{font-size:1.2rem}.price-card .amount{font-size:1.2rem}.price-card .amount small{font-size:.8rem}.pick-bar{flex-wrap:nowrap}.pick-bar .chosen{font-size:.95rem}.line-btn{padding:0 1rem}.price-card .fit{display:none}.price-card[aria-pressed="true"] .fit{display:block}}
</style></head><body>
<a class="skip" href="#main">${tr('ข้ามไปยังเนื้อหา','Skip to content')}</a>
<header class="site-header"><a class="logo" href="/"><img src="/assets/storagebuddy_logo_20260912.png" width="1254" height="1254" alt="StorageBuddy สตอเรจบัดดี้"></a>
<div class="price-top"><a class="lang-link" id="langLink" href="?lang=en">EN</a><a class="line-btn" href="${LINE}">${tr('ทัก LINE','Chat on LINE')}</a></div></header>
<main id="main">
<section class="price-hero"><p class="eyebrow">STORAGEBUDDY · ${tr('พระราม 3','RAMA 3')}</p><h1>${tr('ราคาห้องเก็บของรายเดือน','Monthly storage prices')}</h1>
<p class="lead">${tr('เลือกขนาดที่สนใจ แล้วทักบัดดี้ทาง LINE ได้เลย ไม่แน่ใจขนาด ส่งรูปของมาให้บัดดี้ช่วยประเมินฟรี','Pick a size and chat with Buddy on LINE. Not sure? Send photos of your items and Buddy will estimate the size for free.')}</p></section>
<p class="price-note"><strong>${tr('ข้อมูลก่อนเปิดบริการ','Pre-opening information')}</strong> ${tr(OPEN_TH,OPEN_EN)} ${tr('ราคาต่อเดือนสำหรับลูกค้ารอบแรก ยืนยันขนาดและราคาอีกครั้งก่อนจอง ไม่มีการชำระเงินในขั้นตอนนี้','Monthly prices for first customers. Size and price are confirmed again before booking; no payment is taken at this step.')}</p>
<section class="price-section" aria-labelledby="roomsTitle"><h2 id="roomsTitle">${tr('ห้องเก็บของ','Storage rooms')}</h2><div class="price-grid">${rooms}</div></section>
<section class="price-section" aria-labelledby="lockerTitle"><h2 id="lockerTitle">${tr('ล็อกเกอร์','Lockers')}</h2><div class="price-grid">${locker}</div></section>
<section class="price-section"><div class="promo-box"><div><strong>${tr('อยากรู้โปรโมชันช่วงเปิดตัว?','Want to hear about opening offers?')}</strong><br>${tr('ทักบัดดี้ทาง LINE เพื่อรับรายละเอียดก่อนใคร','Chat with Buddy on LINE to hear first.')}</div><a class="line-btn" href="${LINE}">${tr('ทัก LINE @storagebuddy','LINE @storagebuddy')}</a></div></section>
<section class="price-section faq" aria-labelledby="faqTitle"><h2 id="faqTitle">${tr('คำถามที่พบบ่อย','Questions')}</h2>
${faq.map(([qTh,qEn,aTh,aEn],i)=>`<details><summary>${tr(qTh,qEn)}</summary><p>${tr(aTh,aEn)}${i===1?` <a href="/sizes/" data-en-href="/en/sizes/">${tr('ดูคู่มือขนาดห้อง','Size guide')}</a>`:''}</p></details>`).join('')}
</section>
<p><a href="/location/rama-3/" data-en-href="/en/location/rama-3/">${tr('ดูหมุดอาคารและเส้นทาง','See the building location and directions')}</a></p>
</main>
<div class="pick-bar" role="region" aria-label="เลือกขนาด"><div class="chosen-wrap"><span class="chosen" id="chosen" aria-live="polite">${tr('แตะเลือกขนาดเพื่อดูราคา','Tap a size to see the price')}</span><a class="alt" id="registerLink" href="/register/">${tr('แจ้งความสนใจ →','Register interest →')}</a></div><a class="line-btn" href="${LINE}">${tr('ทัก LINE','Chat on LINE')}</a></div>
<footer><div><strong>StorageBuddy · สตอเรจบัดดี้</strong><p>${tr('StorageBuddy ดำเนินงานโดย บริษัท โฟลว์คราฟท์ โพรเซส โซลูชั่น จำกัด','StorageBuddy is operated by FLOWCRAFT PROCESS SOLUTION CO.,LTD.')}</p></div><div><a href="tel:+66628793645">062-879-3645</a> · <a href="${LINE}">LINE @storagebuddy</a></div></footer>
<script>
(function(){
 const params=new URLSearchParams(location.search),en=params.get('lang')==='en';
 const keep=new URLSearchParams(location.search);keep.delete('lang');
 const withQuery=(href,extra)=>{const u=new URL(href,location.origin);keep.forEach((v,k)=>u.searchParams.set(k,v));Object.entries(extra||{}).forEach(([k,v])=>u.searchParams.set(k,v));return u.pathname+u.search;};
 if(en){document.documentElement.lang='en';document.title='Storage prices Rama 3 | StorageBuddy';document.querySelectorAll('[data-en]').forEach(el=>{el.textContent=el.dataset.en;});document.querySelectorAll('[data-en-href]').forEach(a=>a.setAttribute('href',a.dataset.enHref));}
 const lang=document.getElementById('langLink');lang.textContent=en?'ไทย':'EN';lang.setAttribute('href',withQuery(location.pathname,en?{}:{lang:'en'}));
 document.querySelectorAll('a[href^="/"]').forEach(a=>{if(a!==lang)a.setAttribute('href',withQuery(a.getAttribute('href'),en&&a.id==='registerLink'?{lang:'en'}:{}));});
 const chosen=document.getElementById('chosen'),reg=document.getElementById('registerLink');
 const select=card=>{document.querySelectorAll('.price-card').forEach(c=>c.setAttribute('aria-pressed',String(c===card)));const label=en?card.dataset.labelEn:card.dataset.labelTh,price='฿'+Number(card.dataset.price).toLocaleString('en-US');chosen.textContent=label+' · '+price+(en?'/month':'/เดือน');const extra=card.dataset.size?{size:card.dataset.size}:{};if(en)extra.lang='en';reg.setAttribute('href',withQuery('/register/',extra));};
 document.querySelectorAll('.price-card').forEach(card=>card.addEventListener('click',()=>select(card)));
 const pre=params.get('size');if(pre){const card=document.querySelector('.price-card[data-size="'+CSS.escape(pre)+'"]');if(card)select(card);}
})();
</script>
</body></html>`;
}
module.exports={renderPricePage};
