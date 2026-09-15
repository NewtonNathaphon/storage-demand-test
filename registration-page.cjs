// Reuse the approved registration fields and save handler in a separate page.
const fs=require('node:fs');
function renderRegistrationPage(home){
 const between=(start,end)=>{const a=home.indexOf(start),b=home.indexOf(end,a);if(a<0||b<0)throw new Error('Registration source marker missing: '+start);return home.slice(a,b);};
 let form=between('<form id="leadForm"','<dialog id="voteDialog"');
 form=form.slice(0,form.lastIndexOf('</dialog>')).replace(/<\/div>\s*$/,'');
 form=form.replace(/<button class="text-link" data-close="leadDialog"[^>]*>[\s\S]*?<\/button>/,'<a class="text-link" href="/" data-en="Back to website">กลับไปดูเว็บไซต์</a>');
 const privacy=between('<dialog id="privacyDialog"','\n<script>');
 const config=between('const SUPABASE_URL','let photos');
 const credentials=config.match(/const SUPABASE_(?:URL|ANON_KEY)\s*=\s*"[^"]*";/g).join('\n');
 const persistence=between('const CONFIGURED','const buddyAccessKey');
 const helpers=between('function val(id)','$(\'voteOpen\').onclick')
  .replace('unlockBuddy();','')
  .replace(/requested_width_m:[\s\S]*?,items:val\('fItems'\)/,"requested_width_m:null,requested_depth_m:null,items:val('fItems')");
 const validation=between('function validWithin(id)','document.querySelectorAll(\'[data-close]\')');
 const css=[...home.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
 const script=fs.readFileSync(require('node:path').join(__dirname,'assets/registration.js'),'utf8');
 return `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ลงทะเบียนกับ StorageBuddy | StorageBuddy registration</title><meta name="description" content="บอกความต้องการพื้นที่เก็บของและข้อมูลติดต่อ ให้บัดดี้ช่วยดูแลคุณ"><link rel="canonical" href="https://storagebuddyth.com/register/"><meta name="theme-color" content="#184d43"><meta property="og:title" content="ลงทะเบียนกับ StorageBuddy"><meta property="og:description" content="บอกความต้องการพื้นที่เก็บของ ให้บัดดี้ช่วยดูแลคุณ"><meta property="og:url" content="https://storagebuddyth.com/register/"><meta property="og:image" content="https://storagebuddyth.com/assets/buddy_banner_th.webp"><link rel="icon" href="/assets/storagebuddy_logo_20260912.png"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${css}
body{background:#edf6f2;padding-bottom:0}.registration-header{max-width:820px;margin:auto;display:flex;align-items:center;justify-content:space-between;padding:18px 24px}.registration-header img{width:74px;height:74px;object-fit:contain}.registration-header>div{display:flex;gap:20px;align-items:center}.registration-header a{color:var(--green);font-size:14px}.registration-header button{background:white;border:1px solid #d6e5dc;border-radius:24px;padding:10px 16px;color:var(--green);font:inherit;cursor:pointer}.registration-main{max-width:760px;margin:8px auto 36px;padding:0 20px}.registration-intro{text-align:center;margin:18px 0 28px}.registration-intro h1{font-size:clamp(28px,5vw,38px);color:var(--green);line-height:1.5}.registration-intro p{font-size:15px;color:var(--muted);margin-top:10px}.registration-card{background:#fff;border:1px solid #d6e5dc;border-radius:24px;padding:30px;box-shadow:0 12px 36px #12493708}.registration-card .check-label{color:var(--ink);margin:20px 0}.registration-card .form-actions .btn{width:100%}.registration-footer{text-align:center;font-size:12px;color:var(--muted);padding:0 20px 28px}.registration-footer button{font:inherit;border:0;background:none;color:var(--green);text-decoration:underline;cursor:pointer}.registration-card input,.registration-card select,.registration-card textarea{max-width:100%;min-width:0}.registration-card .success-box{padding:24px 0}.registration-card [hidden]{display:none!important}@media(max-width:540px){.registration-header{padding:12px 20px}.registration-header img{width:62px;height:62px}.registration-card{padding:22px 18px;border-radius:18px}.registration-card .field-row{grid-template-columns:1fr}.registration-main{padding:0 14px}.registration-header>div{gap:12px}}
</style></head><body>
<header class="registration-header"><a href="/" aria-label="StorageBuddy home"><img src="/assets/storagebuddy_logo_20260912.png" alt="StorageBuddy" width="74" height="74"></a><div><a href="/" data-en="Visit website">ดูเว็บไซต์</a><button id="langBtn" type="button" aria-label="Switch to English">🌐 EN</button></div></header>
<main class="registration-main"><div class="registration-intro"><h1 data-en="Let Buddy help you find space">ให้บัดดี้ช่วยหาพื้นที่ให้คุณ</h1><p data-en="Tell us what you need and how to reach you.">บอกความต้องการและข้อมูลติดต่อของคุณ</p></div><section class="registration-card" aria-label="Storage registration">${form}</section></main>
<footer class="registration-footer"><button type="button" data-privacy data-en="Privacy policy">ความเป็นส่วนตัว</button><p>StorageBuddy · FLOWCRAFT PROCESS SOLUTION CO.,LTD.</p></footer>${privacy}
<script>${credentials}\nlet lang='th',leadBusy=false,attachedEstimate=null;const entryPoint='standalone_registration';const params=new URLSearchParams(location.search);const source=(params.get('utm_source')||'shared_form').slice(0,120);const $=id=>document.getElementById(id);const t=(th,en)=>lang==='en'?en:th;\n${persistence}\n${validation}\n${helpers}\n${script}</script></body></html>`.replaceAll('src="assets/','src="/assets/');
}
module.exports={renderRegistrationPage};
