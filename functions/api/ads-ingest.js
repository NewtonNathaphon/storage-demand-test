// Receives daily Google Ads numbers from the Google Ads script (tools/google_ads_daily_sync.js).
// Protected by a secret key: the script's TOKEN must match either Cloudflare env var ADS_INGEST_TOKEN or an active SHA-256 hash in the owner-only table ad_ingest_keys. Writes only to ad_daily.
const DATA_URL='https://tmynmthxjcrnnukmpyox.supabase.co';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const nonNegative=(value,integer=false)=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<1e9&&(!integer||Number.isInteger(value));
const sha256hex=async text=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(b=>b.toString(16).padStart(2,'0')).join('');
async function sameSecret(a,b){const enc=new TextEncoder();const [x,y]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(a)),crypto.subtle.digest('SHA-256',enc.encode(b))]);const u=new Uint8Array(x),v=new Uint8Array(y);let diff=0;for(let i=0;i<u.length;i++)diff|=u[i]^v[i];return diff===0;}
export function validateDaily(body,now=Date.now()){
  if(!body||!Array.isArray(body.rows)||body.rows.length<1||body.rows.length>100)throw Error('INVALID');
  const seen=new Set();
  return body.rows.map(r=>{
    if(!r||!/^\d{4}-\d{2}-\d{2}$/.test(r.day||'')||new Date(r.day+'T00:00:00Z').toISOString().slice(0,10)!==r.day)throw Error('INVALID');
    const t=Date.parse(r.day+'T00:00:00Z');if(t>now+2*864e5||t<now-400*864e5||seen.has(r.day))throw Error('INVALID');seen.add(r.day);
    if(r.currency!=='THB')throw Error('CURRENCY');
    if(!nonNegative(r.impressions,true)||!nonNegative(r.clicks,true))throw Error('INVALID');
    for(const k of ['cost_thb','conversions','line_clicks','reservations','quote_requests'])if(!nonNegative(r[k]))throw Error('INVALID');
    return {day:r.day,channel:'google_ads',impressions:r.impressions,clicks:r.clicks,cost_thb:Math.round(r.cost_thb*100)/100,conversions:Math.round(r.conversions*100)/100,line_clicks:Math.round(r.line_clicks*100)/100,reservations:Math.round(r.reservations*100)/100,quote_requests:Math.round(r.quote_requests*100)/100,currency:'THB',updated_at:new Date(now).toISOString()};
  });
}
export async function onRequest({request,env}){
  if(request.method!=='POST')return json({message:'Method not allowed'},405);
  if(!env.STORAGE_BACKOFFICE_KEY)return json({message:'Ads feed is not configured'},503);
  const headers={apikey:env.STORAGE_BACKOFFICE_KEY,'Content-Type':'application/json'};if(env.STORAGE_BACKOFFICE_KEY.startsWith('eyJ'))headers.Authorization='Bearer '+env.STORAGE_BACKOFFICE_KEY;
  const auth=request.headers.get('authorization')||'',token=auth.slice(7);if(!auth.startsWith('Bearer ')||token.length<24||auth.length>300)return json({message:'Unauthorized'},401);
  let allowed=Boolean(env.ADS_INGEST_TOKEN&&env.ADS_INGEST_TOKEN.length>=24&&await sameSecret(token,env.ADS_INGEST_TOKEN));
  if(!allowed){try{const keys=await fetch(DATA_URL+'/rest/v1/ad_ingest_keys?select=key_hash&active=eq.true&key_hash=eq.'+await sha256hex(token),{headers,signal:AbortSignal.timeout(10000)});allowed=keys.ok&&(await keys.json()).length===1;}catch{return json({message:'Connection interrupted'},503);}}
  if(!allowed)return json({message:'Unauthorized'},401);
  const raw=await request.text();if(raw.length>64000)return json({message:'Too large'},413);
  let rows;try{rows=validateDaily(JSON.parse(raw));}catch(e){return json({message:e.message==='CURRENCY'?'The Google Ads account currency must be THB':'Invalid data'},400);}
  try{const res=await fetch(DATA_URL+'/rest/v1/ad_daily?on_conflict=day,channel',{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows),signal:AbortSignal.timeout(15000)});if(!res.ok)return json({message:'Could not save'},502);return json({saved:rows.length});}
  catch{return json({message:'Connection interrupted'},503);}
}
