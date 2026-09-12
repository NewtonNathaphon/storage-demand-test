// CCAQR owns sign-in. Only an active owner can reach StorageBuddy records.
const AUTH_URL='https://qruwpurikxwvsvdpswab.supabase.co';
const AUTH_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydXdwdXJpa3h3dnN2ZHBzd2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0Njc0MDgsImV4cCI6MjA5MzA0MzQwOH0.qW4nH6qWQOZX8NLt3BPKXAI6eUWX6asGQpPofePcp48';
const DATA_URL='https://tmynmthxjcrnnukmpyox.supabase.co';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const columns={leads:'id,created_at,area,size,segment,customer_use,lean,name,phone,when_needed,utm_source',events:'id,created_at,session_id,event_type,area,detail,utm_source',lead_followups:'lead_id,status,notes,contacted_on,follow_up_on,updated_at'};
export function validateFollowup(value){
  if(!value||!Number.isSafeInteger(value.lead_id)||value.lead_id<1||!['new','contacted','quoted','won','lost'].includes(value.status)||typeof value.notes!=='string'||value.notes.length>10000)throw Error('INVALID_INPUT');
  for(const key of ['contacted_on','follow_up_on'])if(value[key]!==null&&(!/^\d{4}-\d{2}-\d{2}$/.test(value[key]||'')||!Number.isFinite(Date.parse(value[key]))||new Date(value[key]).toISOString().slice(0,10)!==value[key]))throw Error('INVALID_INPUT');
  return {lead_id:value.lead_id,status:value.status,notes:value.notes,contacted_on:value.contacted_on,follow_up_on:value.follow_up_on,updated_at:new Date().toISOString()};
}
export async function onRequest({request,env}){
  if(!['GET','POST'].includes(request.method))return json({message:'Method not allowed'},405);
  const url=new URL(request.url),origin=request.headers.get('origin');if((origin&&origin!==url.origin)||(request.method==='POST'&&origin!==url.origin))return json({message:'Forbidden'},403);
  const authorization=request.headers.get('authorization');if(!/^Bearer [A-Za-z0-9._-]+$/.test(authorization||'')||authorization.length>12000)return json({message:'Please sign in'},401);
  const resource=url.searchParams.get('resource');if(resource!=='identity'&&!Object.hasOwn(columns,resource))return json({message:'Not found'},404);
  try{
    const headers={apikey:AUTH_KEY,Authorization:authorization};
    const userRes=await fetch(AUTH_URL+'/auth/v1/user',{headers,signal:AbortSignal.timeout(10000)});if(!userRes.ok)return json({message:'Your session expired. Please sign in again.'},401);const user=await userRes.json();if(!user.id)return json({message:'Please sign in'},401);
    const roleRes=await fetch(AUTH_URL+'/rest/v1/ccaqr_user_profiles?select=role,active,display_name&user_id=eq.'+encodeURIComponent(user.id),{headers,signal:AbortSignal.timeout(10000)});if(!roleRes.ok)return json({message:'Owner access could not be verified'},403);const roles=await roleRes.json();if(roles.length!==1||roles[0].role!=='owner'||roles[0].active!==true)return json({message:'Only the active CCAQR owner account can access StorageBuddy.'},403);
    if(resource==='identity')return json({email:user.email,name:roles[0].display_name});
    if(!env.STORAGE_BACKOFFICE_KEY)return json({message:'Back office is not configured'},503);
    const dataHeaders={apikey:env.STORAGE_BACKOFFICE_KEY,'Content-Type':'application/json'};if(env.STORAGE_BACKOFFICE_KEY.startsWith('eyJ'))dataHeaders.Authorization='Bearer '+env.STORAGE_BACKOFFICE_KEY;
    let target=DATA_URL+'/rest/v1/'+resource,options={method:request.method,headers:dataHeaders,signal:AbortSignal.timeout(20000)};
    if(request.method==='POST'){
      if(resource!=='lead_followups'||!request.headers.get('content-type')?.startsWith('application/json'))return json({message:'Forbidden'},403);
      const text=await request.text();if(text.length>16000)return json({message:'Request too large'},413);let body;try{body=validateFollowup(JSON.parse(text));}catch{return json({message:'Invalid follow-up details'},400);}
      target+='?on_conflict=lead_id';dataHeaders.Prefer='resolution=merge-duplicates,return=representation';options.body=JSON.stringify(body);
    }else{
      const query=new URLSearchParams({select:columns[resource],order:resource==='leads'?'created_at.desc,id.desc':resource==='events'?'id.asc':'lead_id.asc'});
      for(const key of ['limit','offset']){const value=url.searchParams.get(key)|| (key==='limit'?'1000':'0');if(!/^\d+$/.test(value)||Number(value)>(key==='limit'?1000:100000))return json({message:'Invalid page'},400);query.set(key,value);}
      if(resource!=='lead_followups'){const bounds=url.searchParams.getAll('created_at');if(bounds.length!==2||!bounds.every(v=>/^(gte|lt)\.\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(v)))return json({message:'Choose a date range'},400);bounds.forEach(v=>query.append('created_at',v));}
      target+='?'+query;
    }
    const dataRes=await fetch(target,options);if(!dataRes.ok)return json({message:'Records could not be loaded or saved. Please retry.'},502);return json(await dataRes.json());
  }catch{return json({message:'Connection interrupted. Please retry.'},503);}
}
