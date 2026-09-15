import {readLimited,validateInput,rateAllowed} from './estimate.js';
const DATA_URL='https://tmynmthxjcrnnukmpyox.supabase.co';
const BUCKET='lead-photos';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export function validateIntake(body){
 if(body?.consent!==true||!/^\w{8}-\w{4}-4\w{3}-[89ab]\w{3}-\w{12}$/i.test(body.submission_id||''))throw Error('INVALID');
 const row=body.row,d=JSON.parse(row?.customer_use||'null');
 if(!d||d.kind!=='demand_validation_v2'||typeof row.name!=='string'||row.name.trim().length<2||row.name.length>120||typeof row.phone!=='string'||!/^[+\d\s().-]{8,24}$/.test(row.phone)||row.phone.replace(/\D/g,'').length<8||row.phone.replace(/\D/g,'').length>15||JSON.stringify(d).length>20000)throw Error('INVALID');
 if(!Array.isArray(body.images)||body.images.length<1)throw Error('INVALID');
 const images=validateInput({images:body.images,description:'',language:'th',consent:true}).images;
 const allowed=['version','kind','source','campaign','ad','medium','location','storage_use_case','item_description','items','requested_size','requested_sqm','buddy_recommended_size','ai_estimate','desired_move_in','desired_move_in_date','expected_duration','duration','quoted_price','quoted_size_sqm','price_type','price_version','price_response','budget_thb','readiness_level','phone','line_id','contact_preference','email','entry_point','language','consent_at','consent_version'];
 const details=Object.fromEntries(allowed.filter(k=>Object.hasOwn(d,k)).map(k=>[k,d[k]]));
 Object.assign(details,{lead_status:'NEW',payment_status:'not_collected',photo_submission_id:body.submission_id,photo_consent_at:new Date().toISOString()});
 const clean={name:row.name.trim(),phone:row.phone,area:'rama3',lean:'rama3_enquiry',lean_score:null};
 for(const key of ['size','segment','when_needed','utm_source','utm_area','user_agent'])if(row[key]!==undefined){if(typeof row[key]!=='string'||row[key].length>500)throw Error('INVALID');clean[key]=row[key];}
 clean.price_shown=Number.isSafeInteger(row.price_shown)&&row.price_shown>0?row.price_shown:null;
 return {row:clean,details,images,id:body.submission_id};
}
export async function onRequest({request,env}){
 if(request.method!=='POST')return json({message:'Method not allowed'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({message:'Forbidden'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({message:'Invalid content type'},415);
 if(!env.STORAGE_BACKOFFICE_KEY)return json({message:'Photo saving unavailable'},503);
 let input;try{input=validateIntake(await readLimited(request));}catch{return json({message:'Please check your details and photos'},400);}
 const headers={apikey:env.STORAGE_BACKOFFICE_KEY};if(env.STORAGE_BACKOFFICE_KEY.startsWith('eyJ'))headers.Authorization='Bearer '+env.STORAGE_BACKOFFICE_KEY;
 const fetchData=(path,options={})=>fetch(DATA_URL+path,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(20000)});
 const paths=[];let insertStarted=false;
 try{
  if(!await rateAllowed(request,{...env,ANTHROPIC_API_KEY:env.STORAGE_BACKOFFICE_KEY}))return json({message:'Please try again later'},429);
  // A retry of an already completed submission must not create another lead.
  const lookup=await fetchData('/rest/v1/leads?select=id&limit=1&customer_use=like.'+encodeURIComponent('*"photo_submission_id":"'+input.id+'"*'));
  if(!lookup.ok)throw Error('LOOKUP');if((await lookup.json()).length)return json({saved:true});
  let bucket=await fetchData('/storage/v1/bucket/'+BUCKET);
  if(bucket.status===404||bucket.status===400){bucket=await fetchData('/storage/v1/bucket',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:BUCKET,name:BUCKET,public:false,file_size_limit:700000,allowed_mime_types:['image/jpeg','image/png','image/webp']})});if(!bucket.ok){bucket=await fetchData('/storage/v1/bucket/'+BUCKET);}}
  if(!bucket.ok)throw Error('BUCKET');const info=await bucket.json();if(info.public===true)throw Error('PUBLIC_BUCKET');
  for(let index=0;index<input.images.length;index++){
   const image=input.images[index].source,extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[image.media_type],path=input.id+'/'+index+'.'+extension;
   const binary=Uint8Array.from(atob(image.data),c=>c.charCodeAt(0));
   const upload=await fetchData('/storage/v1/object/'+BUCKET+'/'+path,{method:'POST',headers:{'Content-Type':image.media_type,'x-upsert':'true'},body:binary});if(!upload.ok)throw Error('UPLOAD');paths.push(path);
  }
  input.details.photos=paths.map(path=>({bucket:BUCKET,path}));input.row.customer_use=JSON.stringify(input.details);
  insertStarted=true;
  const saved=await fetchData('/rest/v1/leads',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(input.row)});
  if(!saved.ok){insertStarted=false;throw Error('SAVE');}
  return json({saved:true});
 }catch{
  // Preserve objects if the insert outcome is unknown; a retry checks the submission id.
  if(paths.length&&!insertStarted)try{await fetchData('/storage/v1/object/'+BUCKET,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:paths})});}catch{}
  return json({message:'Could not confirm the save. Your answers and photos are still here; please retry.'},503);
 }
}
