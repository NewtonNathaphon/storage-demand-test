'use strict';
const $=id=>document.getElementById(id),t=(th,en)=>lang==='en'?en:th;
let lang=params.get('lang')==='en'?'en':'th',step=0,busy=false,submitted=false,context=null;
try{const staged=JSON.parse(sessionStorage.getItem('sb_intake_context')||'null');sessionStorage.removeItem('sb_intake_context');if(staged&&Date.now()-staged.at<30*60*1000)context=staged;}catch{}
const translated=[...document.querySelectorAll('[data-en]')];translated.forEach(el=>el.dataset.th=el.innerHTML);
document.querySelectorAll('[data-en-placeholder]').forEach(el=>el.dataset.thPlaceholder=el.placeholder);
const chosen=name=>document.querySelector(`input[name="${name}"]:checked`)?.value||'';
const uses=()=>[...document.querySelectorAll('input[name="use_case"]:checked')].map(el=>el.value);
const sizeRange=s=>s<=2?'1_2':s<=4?'3_4':s<=6?'5_6':s<=10?'7_10':'over_10';
const querySize=Number(params.get('size')),prefillSize=Number(context?.size)||(Number.isFinite(querySize)&&querySize>0&&querySize<=1000?querySize:null);
if(prefillSize)document.querySelector(`input[name="requested_size"][value="${sizeRange(prefillSize)}"]`).checked=true;
if(context?.items)$('itemDescription').value=String(context.items).slice(0,1800);
let questionnaireEstimate=context?.ai_estimate||null,exactRequestedSize=prefillSize;
function activeQuote(){const q=DEMAND_CONFIG.targetPrice;return q&&Number(q.monthly)>0&&sizeRange(q.sqm)===chosen('requested_size')?q:null;}
function updateQuote(){const q=activeQuote();$('targetQuote').hidden=!q;$('budgetOnly').hidden=!!q;if(q)$('quoteText').textContent=t(`${q.sqm} ตร.ม. ราคาเป้าหมายประมาณ ${q.monthly.toLocaleString('th-TH')} บาท/เดือน`,`${q.sqm} m² · target price about ฿${q.monthly.toLocaleString('en-GB')}/month`);}
function setLanguage(next){lang=next;document.documentElement.lang=next;translated.forEach(el=>el.innerHTML=el.dataset[next]);document.querySelectorAll('[data-en-placeholder]').forEach(el=>el.placeholder=el.dataset[next+'Placeholder']);$('langBtn').textContent=next==='th'?'🌐 EN':'🌐 ไทย';$('langBtn').setAttribute('aria-label',next==='th'?'Switch to English':'Switch to Thai');document.title=t('ให้ Buddy เช็กห้องและราคาให้ | StorageBuddy','Let Buddy check rooms and prices | StorageBuddy');updateQuote();window.refreshSizeAssistant?.();}
function showStep(next,scroll=true){step=next;document.querySelectorAll('[data-step]').forEach(el=>el.hidden=Number(el.dataset.step)!==step);document.querySelectorAll('[data-step-indicator]').forEach(el=>{if(Number(el.dataset.stepIndicator)===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});$('backBtn').hidden=step===0;$('nextBtn').hidden=step===2;$('submitBtn').hidden=step!==2;$('formMessage').textContent='';if(scroll){document.querySelector('.form-progress').scrollIntoView({behavior:'smooth',block:'start'});const legend=document.querySelector(`[data-step="${step}"] legend`);legend.tabIndex=-1;legend.focus({preventScroll:true});}}
function fail(message,element){$('formMessage').textContent=message;if(element){element.focus();element.scrollIntoView({block:'center',behavior:'smooth'});}else $('formMessage').focus();return false;}
function validateStep(n){
 const groups=n===0?['use_case','requested_size']:n===1?['desired_move_in','expected_duration',...(activeQuote()?['price_response']:[])]:['readiness_level','contact_preference'];
 for(const name of groups){if(!(name==='use_case'?uses().length:chosen(name)))return fail(t('กรุณาเลือกคำตอบสำหรับคำถามนี้','Please choose an answer to this question.'),document.querySelector(`input[name="${name}"]`));}
 for(const input of document.querySelector(`[data-step="${n}"]`).querySelectorAll('input,textarea'))if(!input.checkValidity()){const details=input.closest('details');if(details)details.open=true;input.reportValidity();return false;}
 if(n===2){const phone=$('phone').value.trim();if(!/^[+\d\s().-]+$/.test(phone)||phone.replace(/\D/g,'').length<8||phone.replace(/\D/g,'').length>15)return fail(t('กรุณาตรวจเบอร์โทรศัพท์ (8–15 หลัก)','Please check your phone number (8–15 digits).'),$('phone'));if($('customerName').value.trim().length<2)return fail(t('กรุณาระบุชื่ออย่างน้อย 2 ตัวอักษร','Please enter your name (at least 2 characters).'),$('customerName'));}
 return true;
}
$('langBtn').onclick=()=>{if(!busy)setLanguage(lang==='th'?'en':'th');};
$('nextBtn').onclick=()=>{if(validateStep(step)){track('demand_step_complete',String(step+1));showStep(step+1);}};
$('backBtn').onclick=()=>{if(!busy)showStep(step-1);};
document.querySelectorAll('input[name="requested_size"]').forEach(el=>el.addEventListener('change',()=>{document.querySelectorAll('input[name="price_response"]').forEach(i=>i.checked=false);updateQuote();}));
document.querySelectorAll('input[name="contact_preference"]').forEach(el=>el.addEventListener('change',()=>{$('lineField').hidden=chosen('contact_preference')!=='line';$('messengerHint').hidden=chosen('contact_preference')!=='messenger';}));
document.querySelectorAll('[data-privacy]').forEach(button=>button.onclick=()=>$('privacyDialog').showModal());
document.querySelectorAll('[data-close="privacyDialog"]').forEach(button=>button.onclick=()=>$('privacyDialog').close());
$('desiredDate').min=new Date(Date.now()+7*3600000).toISOString().slice(0,10);
$('demandForm').onsubmit=async event=>{
 event.preventDefault();if(busy||submitted)return;if(step<2){$('nextBtn').click();return;}
 for(let n=0;n<3;n++){if(n!==step)showStep(n,false);if(!validateStep(n))return;}showStep(2,false);
 if($('website').value)return fail(t('ไม่สามารถส่งข้อมูลได้','Unable to send this request.'));
 const q=activeQuote(),requested=chosen('requested_size'),recommendation=questionnaireEstimate;
 const details={version:5,kind:'demand_validation_v2',lead_status:'NEW',source,campaign:(params.get('utm_campaign')||params.get('campaign_id')||'').slice(0,160),ad:(params.get('utm_content')||params.get('ad_id')||params.get('ad')||'').slice(0,160),medium:(params.get('utm_medium')||'').slice(0,120),location:'rama3',storage_use_case:uses(),item_description:$('itemDescription').value.trim(),items:$('itemDescription').value.trim(),requested_size:requested,requested_sqm:exactRequestedSize&&sizeRange(exactRequestedSize)===requested?exactRequestedSize:null,buddy_recommended_size:recommendation?{min_sqm:recommendation.min_sqm,max_sqm:recommendation.max_sqm}:null,ai_estimate:recommendation,desired_move_in:chosen('desired_move_in'),desired_move_in_date:$('desiredDate').value||null,expected_duration:chosen('expected_duration'),duration:chosen('expected_duration'),quoted_price:q?.monthly||null,quoted_size_sqm:q?.sqm||null,price_type:q?'target_monthly_thb':null,price_version:DEMAND_CONFIG.version,price_response:q?chosen('price_response'):null,budget_thb:$('budget').value?Number($('budget').value):null,readiness_level:chosen('readiness_level'),phone:$('phone').value.trim(),line_id:chosen('contact_preference')==='line'?$('lineId').value.trim():'',contact_preference:chosen('contact_preference'),email:$('email').value.trim(),entry_point:context?.entry||'standalone_questionnaire',language:lang,payment_status:'not_collected',consent_at:new Date().toISOString(),consent_version:'demand_v2_2026_09_15'};
 const row={area:'rama3',size:requested,segment:uses()[0],customer_use:JSON.stringify(details),lean:'rama3_enquiry',lean_score:null,name:$('customerName').value.trim(),phone:details.phone,when_needed:details.desired_move_in,price_shown:details.quoted_price,utm_source:source,utm_area:'rama3',user_agent:navigator.userAgent.slice(0,500)};
 busy=true;for(const id of ['submitBtn','backBtn','langBtn'])$(id).disabled=true;$('formMessage').textContent=t('กำลังส่งข้อมูลให้ Buddy…','Sending your details to Buddy…');
 const ok=await sbInsert('leads',row);busy=false;for(const id of ['submitBtn','backBtn','langBtn'])$(id).disabled=false;
 if(ok){submitted=true;window.disposeSizeAssistant?.();$('demandForm').hidden=true;document.querySelector('.form-progress').hidden=true;$('leadSuccess').hidden=false;$('successMessenger').hidden=details.contact_preference!=='messenger';$('leadSuccess').focus();$('leadSuccess').scrollIntoView({behavior:'smooth',block:'start'});track('demand_saved',details.readiness_level);}else{fail(t('ยังยืนยันการบันทึกไม่ได้ ข้อมูลที่กรอกยังอยู่ กรุณาลองส่งอีกครั้ง','We couldn’t confirm your save. Your answers are still here. Please try again.'));track('demand_save_failed');}
};
$('successLine').onclick=()=>track('contact_click','demand_success_line');$('successMessenger').onclick=()=>track('contact_click','demand_success_messenger');
setLanguage(lang);showStep(0,false);track('page_view','demand_questionnaire_v2');
