'use strict';
(()=>{
 let photos=[],controller=null,revision=0,preparing=false,applied=false;
 const message=text=>{$('estimateMessage').textContent=text;};
 const loader=document.createElement('div');
 loader.className='buddy-loading';loader.hidden=true;loader.setAttribute('aria-hidden','true');
 loader.innerHTML='<span class="buddy-loading-box"><span class="buddy-loading-eyes"></span><span class="buddy-loading-smile"></span></span><span class="buddy-loading-dots"><i></i><i></i><i></i></span>';
 $('estimateMessage').before(loader);
 function render(){
  const result=questionnaireEstimate;
  $('estimateResult').hidden=!result;
  if(result){$('estimateRange').textContent=`${result.min_sqm}–${result.max_sqm} ${t('ตร.ม.','m²')}`;$('estimateReason').textContent=result.reasoning;}
  $('estimateSize').disabled=preparing||!!controller;
  loader.hidden=!controller;
  $('estimateResult').setAttribute('aria-busy',String(!!controller));
  $('estimatePreviews').replaceChildren();
  photos.forEach((url,index)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',t(`ลบรูป ${index+1}`,`Remove photo ${index+1}`));const img=document.createElement('img');img.src=url;img.alt='';button.append(img);button.onclick=()=>{invalidate();photos.splice(index,1);render();};$('estimatePreviews').append(button);});
 }
 function invalidate(){revision++;controller?.abort();controller=null;questionnaireEstimate=null;exactRequestedSize=null;if(applied){document.querySelector('[name="requested_size"][value="unsure"]').checked=true;updateQuote();applied=false;}message('');render();}
 async function prepare(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)throw Error('PHOTO');
  const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
  try{const scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',.76);if(data.length>900000)throw Error('PHOTO');return data;}finally{bitmap.close();}
 }
 $('itemDescription').addEventListener('input',invalidate);
 document.querySelectorAll('[name="requested_size"]').forEach(input=>input.addEventListener('change',()=>{applied=false;exactRequestedSize=null;if(input.value==='unsure')$('sizeAssistant').open=true;}));
 $('estimatePhotos').onchange=async event=>{
  const files=[...event.target.files];event.target.value='';if(!files.length)return;
  invalidate();const version=revision;
  if(files.length+photos.length>4){message(t('เพิ่มได้สูงสุด 4 รูป กรุณาลบรูปก่อนเพิ่ม','Up to 4 photos. Remove a photo before adding more.'));return;}
  preparing=true;render();
  try{const prepared=await Promise.all(files.map(prepare));if(version===revision)photos.push(...prepared);}catch{message(t('กรุณาใช้รูป JPG, PNG หรือ WebP ที่เปิดได้ ขนาดไม่เกิน 8 MB ต่อรูป','Please use readable JPG, PNG or WebP photos, up to 8 MB each.'));}finally{preparing=false;render();}
 };
 $('estimateSize').onclick=async()=>{
  if(controller||preparing)return;
  const description=$('itemDescription').value.trim();
  if(description.length>1600){message(t('กรุณาย่อรายละเอียดให้ไม่เกิน 1,600 ตัวอักษรเพื่อประเมิน','Please shorten item details to 1,600 characters for estimation.'));return;}
  if(!photos.length&&description.length<10){message(t('บอกประเภทและจำนวนของในช่องรายละเอียดด้านบน หรือเพิ่มรูปก่อนนะครับ','Add item types and quantities in the details above, or add a photo first.'));$('itemDescription').focus();return;}
  invalidate();const version=revision,request=new AbortController();controller=request;render();message(t('Buddy กำลังประเมินขนาดให้คุณ…','Buddy is estimating your space…'));const timer=setTimeout(()=>request.abort(),65000);
  try{
   const response=await fetch('/api/estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true,language:lang,description,images:photos}),signal:request.signal});const data=await response.json();
   if(version!==revision)return;
   if(!response.ok)throw Error(response.status===429?'RATE_LIMIT':'FAILED');
   if(!Number.isFinite(data.min_sqm)||!Number.isFinite(data.max_sqm)||data.min_sqm<.25||data.max_sqm<data.min_sqm||data.max_sqm>100||typeof data.reasoning!=='string')throw Error('FAILED');
   questionnaireEstimate=data;message('');track('questionnaire_estimate_complete',photos.length?'photo':'text');
  }catch(error){if(version===revision)message(error.message==='RATE_LIMIT'?t('ประเมินครบจำนวนครั้งแล้ว คุณส่งคำขอให้ Buddy ช่วยต่อได้เลย','The estimate limit has been reached. You can still send your request for Buddy to help.'):t('ยังประเมินไม่ได้ ลองอีกครั้ง หรือเลือกให้ Buddy ช่วยประเมินแล้วกรอกต่อได้เลย','The estimate could not be completed. Retry, or choose “Not sure” and continue.'));}
  finally{clearTimeout(timer);if(version===revision){controller=null;render();}}
 };
 $('acceptEstimate').onclick=()=>{
  if(!questionnaireEstimate)return;
  const input=document.querySelector(`[name="requested_size"][value="${sizeRange(questionnaireEstimate.max_sqm)}"]`);input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));applied=true;exactRequestedSize=null;
  message(t('เลือกขนาดที่แนะนำแล้ว กดถัดไปได้เลย','Recommended size selected. You can continue.'));track('questionnaire_estimate_accepted');
 };
 window.refreshSizeAssistant=render;
 window.disposeSizeAssistant=()=>{revision++;controller?.abort();controller=null;photos=[];render();};
 window.addEventListener('pagehide',window.disposeSizeAssistant);
 render();
})();
