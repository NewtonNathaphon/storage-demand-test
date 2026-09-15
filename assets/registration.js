// Page-only behavior. The homepage does not load this script.
const translated=[...document.querySelectorAll('[data-en]')];
translated.forEach(el=>el.dataset.th=el.innerHTML);
document.querySelectorAll('[data-en-placeholder]').forEach(el=>el.dataset.thPlaceholder=el.placeholder);
function setLanguage(next){
 lang=next;document.documentElement.lang=next;
 translated.forEach(el=>el.innerHTML=el.dataset[next]);
 document.querySelectorAll('[data-en-placeholder]').forEach(el=>el.placeholder=el.dataset[next+'Placeholder']);
 $('langBtn').textContent=next==='th'?'🌐 EN':'🌐 ไทย';
 $('langBtn').setAttribute('aria-label',next==='th'?'Switch to English':'Switch to Thai');
 document.title=next==='th'?'ลงทะเบียนกับ StorageBuddy':'Register with StorageBuddy';
}
$('langBtn').onclick=()=>setLanguage(lang==='th'?'en':'th');
$('fSize').onchange=()=>{$('largerField').hidden=$('fSize').value!=='larger';};
document.querySelectorAll('[data-privacy]').forEach(button=>button.onclick=()=>$('privacyDialog').showModal());
document.querySelectorAll('[data-close="privacyDialog"]').forEach(button=>button.onclick=()=>$('privacyDialog').close());
setLanguage(params.get('lang')==='en'?'en':'th');
track('page_view','standalone_registration');
