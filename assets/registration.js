'use strict';
const $=id=>document.getElementById(id),t=(th,en)=>lang==='en'?en:th;
let lang=params.get('lang')==='en'?'en':'th',step=0,busy=false,submitted=false,context=null;
try{const staged=JSON.parse(sessionStorage.getItem('sb_intake_context')||'null');sessionStorage.removeItem('sb_intake_context');if(staged&&Date.now()-staged.at<30*60*1000)context=staged;}catch{}
const translated=[...document.querySelectorAll('[data-en]')];translated.forEach(el=>el.dataset.th=el.innerHTML);document.querySelectorAll('[data-en-placeholder]').forEach(el=>el.dataset.thPlaceholder=el.placeholder);
const chosen=name=>document.querySelector(`input[name="${name}"]:checked`)?.value||'';
const uses=()=>[...document.querySelectorAll('input[name="use_case"]:checked')].map(el=>el.value);
// Legacy size groups, kept so the dashboard and backoffice keep grouping old and new leads the same way.
const sizeRange=s=>s<=2?'1_2':s<=4?'3_4':s<=6?'5_6':s<=10?'7_10':'over_10';
const baht=n=>'฿'+Math.round(n).toLocaleString('en-GB');
const ROOMS=DEMAND_CONFIG.rooms,PLANS=Object.fromEntries([...DEMAND_CONFIG.plans,...DEMAND_CONFIG.founding.plans].map(plan=>[plan.id,plan]));

// Start months: now, the next four months, then "that month or later". Bangkok time, Buddhist year in Thai.
const MONTHS_TH=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],MONTHS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const bangkokNow=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'}).split('-').map(Number);
const monthKey=offset=>{const index=bangkokNow[0]*12+bangkokNow[1]-1+offset;return `${Math.floor(index/12)}-${String(index%12+1).padStart(2,'0')}`;};
const monthLabel=key=>{const [y,m]=key.split('-').map(Number);return t(`${MONTHS_TH[m-1]} ${y+543}`,`${MONTHS_EN[m-1]} ${y}`);};
const moveInOptions=[{value:'now'},...[1,2,3,4].map(n=>({value:'m:'+monthKey(n),month:monthKey(n)})),{value:'later:'+monthKey(5),month:monthKey(5),later:true},{value:'unsure'}];
function moveInLabel(option){if(option.value==='now')return t('ตอนนี้เลย','Right now');if(option.value==='unsure')return t('ยังไม่แน่ใจ','Not sure yet');return option.later?t(`${monthLabel(option.month)} หรือหลังจากนั้น`,`${monthLabel(option.month)} or later`):monthLabel(option.month);}
function renderMoveIn(){const current=chosen('desired_move_in'),box=$('moveInChoices');box.replaceChildren();for(const option of moveInOptions){const label=document.createElement('label');label.className='choice'+(option.value==='unsure'?' wide':'');const input=document.createElement('input');input.type='radio';input.name='desired_move_in';input.value=option.value;input.checked=option.value===current;input.addEventListener('change',updateQuote);const span=document.createElement('span');span.textContent=moveInLabel(option);label.append(input,span);box.append(label);}}
const moveIn=()=>{const value=chosen('desired_move_in');if(value.startsWith('m:'))return {code:'in_month',date:value.slice(2)+'-01'};if(value.startsWith('later:'))return {code:'month_or_later',date:value.slice(6)+'-01'};return {code:value,date:null};};
const beforeOpening=()=>{const m=moveIn();return m.code==='now'||(m.code==='in_month'&&m.date.slice(0,7)<DEMAND_CONFIG.opening.month);};

// Prefill from the homepage size helper or a ?size= link: pick the exact room, or the next size up.
const querySize=Number(params.get('size')),prefillSize=Number(context?.size)||(Number.isFinite(querySize)&&querySize>0&&querySize<=1000?querySize:null);
function selectSize(sqm){if(sqm<=1){document.querySelector('input[name="requested_size"][value="locker"]').checked=true;return;}const room=ROOMS.find(r=>r.sqm>=sqm);const value=room?String(room.sqm):'over_10';const input=document.querySelector(`input[name="requested_size"][value="${value}"]`);if(input)input.checked=true;if(!room)$('largeSqm').value=String(Math.ceil(sqm));}
if(prefillSize)selectSize(prefillSize);
if(context?.items)$('itemDescription').value=String(context.items).slice(0,1800);
let questionnaireEstimate=context?.ai_estimate||null,exactRequestedSize=prefillSize,savedSummary=null;

// What the customer picked: a locker, an exact room, a large space (joined rooms), or nothing yet.
function selection(){const value=chosen('requested_size');if(value==='locker')return {...DEMAND_CONFIG.locker,kind:'locker'};if(value==='over_10'){const sqm=Number($('largeSqm').value);return {kind:'large',sqm:Number.isFinite(sqm)&&sqm>10?Math.round(sqm):null};}const room=ROOMS.find(r=>String(r.sqm)===value);return room?{...room,kind:'room'}:null;}
// Approved plan for the chosen length of stay. Founding Buddy applies to rooms on 6 and 12 months.
function planFor(item,duration){const founding=item.kind==='room'||(item.kind==='locker'&&DEMAND_CONFIG.founding.lockers);return PLANS[{'1_month':'monthly','3_months':'prepay_3','6_months':founding?'founding_6':'prepay_6','12_months':founding?'founding_12':'prepay_12',over_12_months:founding?'founding_12':'prepay_12'}[duration]]||null;}
// Totals round down to the whole baht, matching the Quote tab in the sales sheet.
function priceFor(item,plan){const total=Math.floor(item.monthly*plan.paid*(100-plan.discount)/100),full=item.monthly*plan.months,deposit=item.monthly*plan.deposit;return {plan,total,full,saving:full-total,average:total/plan.months,deposit,atSigning:total+deposit,founding:plan.id.startsWith('founding')};}
function activeQuote(){const item=selection(),duration=chosen('expected_duration');if(!item||item.kind==='large'||!duration)return null;const plan=planFor(item,duration);return plan?{item,...priceFor(item,plan)}:null;}
function itemLabel(item){if(!item)return t('ให้บัดดี้ช่วยเลือกขนาด','Buddy to suggest a size');if(item.kind==='locker')return t('ล็อกเกอร์ 1 ช่อง (1×1 ม.)','1 locker box (1×1 m)');if(item.kind==='large')return item.sqm?t(`พื้นที่ประมาณ ${item.sqm} ตร.ม.`,`About ${item.sqm} m²`):t('พื้นที่มากกว่า 10 ตร.ม.','Over 10 m²');return t(`ห้อง ${item.sqm} ตร.ม.`,`${item.sqm} m² room`);}
function durationLabel(){const label=document.querySelector('input[name="expected_duration"]:checked')?.closest('label');return label?label.innerText.trim():'';}
function planLabel(plan){return {monthly:t('รายเดือน แจ้งย้ายออกล่วงหน้า 30 วัน','Monthly, 30 days’ notice to move out'),prepay_3:t('จ่ายล่วงหน้า 3 เดือน ลด 5%','Prepay 3 months, 5% off'),prepay_6:t('จ่ายล่วงหน้า 6 เดือน ลด 10%','Prepay 6 months, 10% off'),prepay_12:t('จ่ายล่วงหน้า 12 เดือน จ่าย 10 ได้ 12','Prepay 12 months, pay 10 get 12'),founding_6:t('จ่าย 5 เดือน ได้ใช้ 6 เดือน','Pay 5 months, store for 6'),founding_12:t('จ่าย 7 เดือน ได้ใช้ 12 เดือน','Pay 7 months, store for 12')}[plan.id];}
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
function row(box,label,value){const line=el('div','price-row');line.append(el('span','',label),el('strong','',value));box.append(line);}
function renderPrice(){const box=$('priceResult'),item=selection(),duration=chosen('expected_duration'),q=activeQuote();box.replaceChildren();
 const ready=item&&duration&&(q||item.kind==='large')||(chosen('requested_size')==='unsure'&&duration);
 $('priceEmpty').hidden=!!ready;box.hidden=!ready;$('pricePanel').classList.toggle('has-offer',!!q?.founding);if(!ready)return;
 if(!q){box.append(el('p','price-title',itemLabel(item)+(duration?' · '+durationLabel():'')));
  box.append(el('p','price-note',item?.kind==='large'?t('ห้องใหญ่กว่า 10 ตร.ม. เปิดห้องต่อกันได้ บัดดี้จะคำนวณราคาพร้อมโปรเปิดตัวให้เป็นพิเศษ กดขอราคาแล้วกรอกข้อมูลติดต่อได้เลย','Spaces over 10 m² are made by joining rooms. Buddy will prepare a special price with the opening offer. Request a price and leave your details.'):t('บัดดี้จะช่วยเลือกขนาดที่พอดีและแจ้งราคาพร้อมโปรให้ หรือย้อนกลับไปส่งรูปของให้ช่วยประเมินขนาดก่อนก็ได้','Buddy will suggest the right size and send your price with the opening offer. You can also go back and add photos for a size estimate.')));return;}
 if(q.founding)box.append(el('span','offer-badge',t('โปรเปิดตัว Founding Buddy','Founding Buddy opening offer')));
 box.append(el('p','price-title',itemLabel(q.item)+' · '+durationLabel()));
 box.append(el('p','price-plan',planLabel(q.plan)));
 const big=el('div','price-big');big.append(el('strong','',q.plan.id==='monthly'?baht(q.item.monthly)+t('/เดือน','/month'):baht(q.total)));if(q.saving>0)big.append(el('s','',t('ปกติ ','Usually ')+baht(q.full)));box.append(big);
 const rows=el('div','price-rows');
 if(q.plan.id!=='monthly'){row(rows,t('เฉลี่ยต่อเดือน','Average per month'),baht(q.average));if(q.saving>0)row(rows,t('ประหยัด','You save'),baht(q.saving));}
 row(rows,t('ค่ามัดจำ','Deposit'),q.deposit?baht(q.deposit)+t(' (1 เดือน)',' (1 month)'):t('ไม่ต้องวาง','None'));
 row(rows,t('ชำระวันทำสัญญา','Due when you sign'),baht(q.atSigning));box.append(rows);
 if(q.item.kind==='locker')box.append(el('p','price-note',t('ล็อกเกอร์ขนาด 1×1 ม. ราคาต่อ 1 ช่อง ชั้นบนหรือชั้นล่างของตู้แบบซ้อน','Locker size 1×1 m. Price per box, an upper or lower compartment in a stacked unit.')));
 if(q.founding){const normal=priceFor(q.item,PLANS[q.plan.months===6?'prepay_6':'prepay_12']);box.append(el('p','price-note',t(`โปรเปิดตัวมีจำนวนจำกัด จองก่อนได้สิทธิ์ก่อน ถึง ${DEMAND_CONFIG.founding.daysAfterOpening} วันหลังวันเปิด หลังจากนั้นราคาแพ็กเกจนี้คือ ${baht(normal.total)}`,`The opening offer is limited, first come first served, until ${DEMAND_CONFIG.founding.daysAfterOpening} days after opening. After that this plan costs ${baht(normal.total)}.`)));}
 if(chosen('expected_duration')==='over_12_months')box.append(el('p','price-note',t('ราคานี้สำหรับ 12 เดือนแรก','This price covers the first 12 months.')));
 if(q.plan.id!=='monthly')box.append(el('p','price-note',t('หลังจากนั้น ต่อสัญญาด้วยแพ็กเกจใหม่ หรือใช้ต่อแบบรายเดือนในราคาปกติ','After that, renew with a new plan or continue monthly at the standard price.')));
 if(['1_month','3_months'].includes(duration)&&(q.item.kind==='room'||DEMAND_CONFIG.founding.lockers)){const better=priceFor(q.item,PLANS.founding_6),nudge=el('button','price-nudge');nudge.type='button';nudge.textContent=t(`เก็บ 6 เดือนขึ้นไป รับโปรเปิดตัว จ่าย 5 ได้ 6 เฉลี่ย ${baht(better.average)}/เดือน →`,`Store 6 months or more: pay 5 get 6, average ${baht(better.average)}/month →`);nudge.onclick=()=>{document.querySelector('input[name="expected_duration"][value="6_months"]').checked=true;updateQuote();track('price_nudge_6_months');};box.append(nudge);}
 if(beforeOpening())box.append(el('p','price-note',t(`เราคาดเปิด${DEMAND_CONFIG.opening.th} จองสิทธิ์ไว้ก่อนได้ บัดดี้จะแจ้งวันเปิดให้ก่อนใคร`,`We expect to open in ${DEMAND_CONFIG.opening.en}. Reserve now and Buddy will tell you the opening date first.`)));
}
function summaryText(){const q=activeQuote(),item=selection(),m=moveIn(),start=m.code==='now'?t('ตอนนี้เลย','right now'):m.date?moveInLabel(moveInOptions.find(o=>o.value===chosen('desired_move_in'))):t('ยังไม่แน่ใจ','not sure yet');
 const what=q?`${itemLabel(q.item)} · ${durationLabel()} · ${q.founding?'Founding ':''}${q.plan.id==='monthly'?baht(q.item.monthly)+t('/เดือน','/month'):baht(q.total)}`:`${itemLabel(item)} · ${durationLabel()} · ${t('บัดดี้แจ้งราคาให้','Buddy will send your price')}`;
 return what+' · '+t('เริ่ม ','Start ')+start;}
function updateQuote(){$('largeField').hidden=chosen('requested_size')!=='over_10';renderPrice();const q=activeQuote();
 const askPrice=!q&&chosen('expected_duration')&&['over_10','unsure'].includes(chosen('requested_size'));$('nextBtn').textContent=step===1&&q?t('จองราคานี้ฟรี →','Reserve this price free →'):step===1&&askPrice?t('ขอราคาฟรี →','Request my price →'):t('ถัดไป →','Continue →');
 $('bookingSummary').textContent=t('สรุปการจอง: ','Your reservation: ')+summaryText();
 if(savedSummary)$('successSummary').textContent=savedSummary;}
// Renter details: company renters give tax details so receipts and the 5% withholding are correct.
const isCompany=()=>chosen('customer_type')==='company';
function updateRenter(){const company=isCompany(),pref=chosen('contact_preference');$('companyFields').hidden=!company;$('branchField').hidden=!company||chosen('company_branch')!=='branch';$('lineField').hidden=pref!=='line';$('messengerField').hidden=pref!=='messenger';$('phoneHint').hidden=pref!=='phone';
 $('nameLabel').textContent=company?t('ชื่อผู้ติดต่อ *','Contact person *'):t('ชื่อ-นามสกุล *','Full name *');$('addressLabel').textContent=company?t('ที่อยู่บริษัทตามหนังสือรับรอง (ใช้ออกใบเสร็จ) *','Registered company address (for receipts) *'):t('ที่อยู่สำหรับทำสัญญาและออกเอกสาร *','Address for the agreement and documents *');}
const taxDigits=()=>$('taxId').value.replace(/\D/g,'');
// Thai 13-digit tax ID check digit (same rule as the national ID).
function validTaxId(id){if(!/^\d{13}$/.test(id))return false;let sum=0;for(let i=0;i<12;i++)sum+=Number(id[i])*(13-i);return (11-sum%11)%10===Number(id[12]);}
function setLanguage(next){lang=next;document.documentElement.lang=next;translated.forEach(el=>el.innerHTML=el.dataset[next]);document.querySelectorAll('[data-en-placeholder]').forEach(el=>el.placeholder=el.dataset[next+'Placeholder']);$('langBtn').textContent=next==='th'?'🌐 EN':'🌐 ไทย';$('langBtn').setAttribute('aria-label',next==='th'?'Switch to English':'Switch to Thai');document.title=t('เช็กราคาและโปรของคุณ | StorageBuddy','Check your price and offer | StorageBuddy');renderMoveIn();updateQuote();updateRenter();window.refreshSizeAssistant?.();}
function showStep(next,scroll=true){step=next;document.querySelectorAll('[data-step]').forEach(el=>el.hidden=Number(el.dataset.step)!==step);document.querySelectorAll('[data-step-indicator]').forEach(el=>{if(Number(el.dataset.stepIndicator)===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});$('backBtn').hidden=step===0;$('nextBtn').hidden=step===2;$('submitBtn').hidden=step!==2;$('formMessage').textContent='';updateQuote();if(scroll){document.querySelector('.form-progress').scrollIntoView({behavior:'smooth',block:'start'});const legend=document.querySelector(`[data-step="${step}"] legend`);legend.tabIndex=-1;legend.focus({preventScroll:true});}}
function fail(message,element){$('formMessage').textContent=message;if(element){element.focus();element.scrollIntoView({block:'center',behavior:'smooth'});}else $('formMessage').focus();return false;}
function validateStep(n){
 const groups=n===0?['use_case','requested_size']:n===1?['desired_move_in','expected_duration']:['customer_type',...(isCompany()?['company_branch']:[]),'contact_preference'];
 for(const name of groups){if(!(name==='use_case'?uses().length:chosen(name)))return fail(t('กรุณาเลือกคำตอบสำหรับคำถามนี้','Please choose an answer to this question.'),document.querySelector(`input[name="${name}"]`));}
 for(const input of document.querySelector(`[data-step="${n}"]`).querySelectorAll('input,textarea'))if(!input.disabled&&!input.closest('[hidden]')&&!input.checkValidity()){const details=input.closest('details');if(details)details.open=true;input.reportValidity();return false;}
 if(n===2){const phone=$('phone').value.trim();if(!/^[+\d\s().-]+$/.test(phone)||phone.replace(/\D/g,'').length<8||phone.replace(/\D/g,'').length>15)return fail(t('กรุณาตรวจเบอร์โทรศัพท์ (8–15 หลัก)','Please check your phone number (8–15 digits).'),$('phone'));if($('customerName').value.trim().length<2)return fail(t('กรุณาระบุชื่ออย่างน้อย 2 ตัวอักษร','Please enter your name (at least 2 characters).'),$('customerName'));if(isCompany()&&!validTaxId(taxDigits()))return fail(t('กรุณาตรวจเลขประจำตัวผู้เสียภาษี 13 หลัก','Please check the 13-digit tax ID.'),$('taxId'));}
 return true;
}
$('langBtn').onclick=()=>{if(!busy)setLanguage(lang==='th'?'en':'th');};
$('nextBtn').onclick=()=>{if(validateStep(step)){track('demand_step_complete',String(step+1));if(step===1)track(activeQuote()?'price_reserve_click':'price_request_click',chosen('expected_duration'));showStep(step+1);}};
$('backBtn').onclick=()=>{if(!busy)showStep(step-1);};
document.querySelectorAll('input[name="requested_size"],input[name="expected_duration"]').forEach(el=>el.addEventListener('change',()=>{exactRequestedSize=null;updateQuote();}));
$('largeSqm').addEventListener('input',updateQuote);
document.querySelectorAll('input[name="contact_preference"],input[name="customer_type"],input[name="company_branch"]').forEach(el=>el.addEventListener('change',updateRenter));
document.querySelectorAll('[data-privacy]').forEach(button=>button.onclick=()=>$('privacyDialog').showModal());
document.querySelectorAll('[data-close="privacyDialog"]').forEach(button=>button.onclick=()=>$('privacyDialog').close());
$('demandForm').onsubmit=async event=>{
 event.preventDefault();if(busy||submitted)return;if(step<2){$('nextBtn').click();return;}
 for(let n=0;n<3;n++){if(n!==step)showStep(n,false);if(!validateStep(n))return;}showStep(2,false);
 if($('website').value)return fail(t('ไม่สามารถส่งข้อมูลได้','Unable to send this request.'));
 const q=activeQuote(),item=selection(),m=moveIn(),recommendation=questionnaireEstimate,sqm=item?.sqm||null;
 const requested=item?.kind==='locker'?'locker':item?.kind==='large'?'over_10':sqm?sizeRange(sqm):'unsure';
 const details={version:7,kind:'demand_validation_v2',lead_status:'NEW',source,campaign:(params.get('utm_campaign')||params.get('campaign_id')||'').slice(0,160),ad:(params.get('utm_content')||params.get('ad_id')||params.get('ad')||'').slice(0,160),medium:(params.get('utm_medium')||'').slice(0,120),location:'rama3',storage_use_case:uses(),item_description:$('itemDescription').value.trim(),items:$('itemDescription').value.trim(),requested_size:requested,requested_sqm:item?.kind==='locker'?null:sqm,buddy_recommended_size:recommendation?{min_sqm:recommendation.min_sqm,max_sqm:recommendation.max_sqm}:null,ai_estimate:recommendation,desired_move_in:m.code,desired_move_in_date:m.date,expected_duration:chosen('expected_duration'),duration:chosen('expected_duration'),
  quoted_price:q?.item.monthly||null,quoted_size_sqm:q?.item.kind==='room'?q.item.sqm:null,quoted_product_type:q?q.item.kind:null,price_type:q?'list_monthly_thb':null,price_version:DEMAND_CONFIG.version,quoted_price_min:q?.item.monthly||null,quoted_price_max:q?.item.monthly||null,quoted_sizes:q?.item.kind==='room'?[q.item.sqm]:[],
  payment_plan:q?.plan.id||null,plan_months:q?.plan.months||null,plan_paid_months:q?.plan.paid||null,plan_discount_pct:q?.plan.discount??null,quote_total:q?.total||null,quote_average_monthly:q?Math.round(q.average):null,quote_saving:q?.saving||null,deposit_amount:q?q.deposit:null,founding_offer:!!q?.founding,
  next_step:q?'reserve_free':'quote_request',price_response:null,budget_thb:null,readiness_level:q?'reserved_free':'needs_quote',phone:$('phone').value.trim(),line_id:chosen('contact_preference')==='line'?$('lineId').value.trim():'',messenger_name:chosen('contact_preference')==='messenger'?$('messengerName').value.trim():'',contact_preference:chosen('contact_preference'),email:$('email').value.trim(),address:$('address').value.trim(),customer_type:chosen('customer_type'),company_name:isCompany()?$('companyName').value.trim():'',tax_id:isCompany()?taxDigits():'',company_branch:isCompany()?(chosen('company_branch')==='branch'?$('branchNo').value.trim():'00000'):'',withholding_tax:isCompany()&&$('withholdingTax').checked,entry_point:context?.entry||'standalone_questionnaire',language:lang,payment_status:'not_collected',consent_at:new Date().toISOString(),consent_version:'reserve_storage_buddy_2026_11_06'};
 const row={area:'rama3',size:requested,segment:uses()[0],customer_use:JSON.stringify(details),lean:'rama3_enquiry',lean_score:null,name:$('customerName').value.trim(),phone:details.phone,when_needed:m.date?m.code+':'+m.date.slice(0,7):m.code,price_shown:q?(q.plan.id==='monthly'?q.item.monthly:q.total):null,utm_source:source,utm_area:'rama3',user_agent:navigator.userAgent.slice(0,500)};
 busy=true;for(const id of ['submitBtn','backBtn','langBtn'])$(id).disabled=true;$('formMessage').textContent=t('กำลังบันทึกการจองสิทธิ์…','Saving your reservation…');
 const summary=summaryText(),ok=await (window.saveQuestionnaireWithPhotos?window.saveQuestionnaireWithPhotos(row):sbInsert('leads',row));
 busy=false;for(const id of ['submitBtn','backBtn','langBtn'])$(id).disabled=false;
 if(ok){savedSummary=summary;submitted=true;updateQuote();window.disposeSizeAssistant?.();$('demandForm').hidden=true;document.querySelector('.form-progress').hidden=true;$('leadSuccess').hidden=false;$('successMessenger').hidden=details.contact_preference!=='messenger';$('leadSuccess').focus();$('leadSuccess').scrollIntoView({behavior:'smooth',block:'start'});track('demand_saved',details.readiness_level);
  if(details.next_step==='reserve_free'&&typeof window.gtag==='function')window.gtag('event','conversion',{send_to:'AW-16778280533/c4qzCMDIurMdENX8wMA-'});
 }
 else{fail(t('ยังยืนยันการบันทึกไม่ได้ ข้อมูลที่กรอกยังอยู่ กรุณาลองส่งอีกครั้ง','We couldn’t confirm your save. Your answers are still here. Please try again.'));track('demand_save_failed');}
};
$('successLine').onclick=()=>track('contact_click','demand_success_line');
$('successMessenger').onclick=()=>track('contact_click','demand_success_messenger');
document.querySelector('[data-contact="line_price"]').onclick=()=>track('contact_click','price_line');
setLanguage(lang);showStep(0,false);track('page_view','demand_questionnaire_v3');
