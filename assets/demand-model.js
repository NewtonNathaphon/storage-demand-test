(function(root){
 'use strict';
 const statuses=['NEW','QUALIFIED','PRICE_ACCEPTED','WANTS_VISIT','READY_TO_CONFIRM','WAITING_FOR_AVAILABILITY','NOT_READY','PRICE_TOO_HIGH','LOST'];
 const windows={now:0,within_7_days:7,within_30_days:30,within_1_month:30,in_1_3_months:90,'1_3_months':90};
 function details(row){try{return JSON.parse(row.customer_use)||{};}catch{return {};}}
 function urgency(d,row){
  if(d.desired_move_in_date&&row.created_at){const submitted=new Date(new Date(row.created_at).getTime()+7*3600000).toISOString().slice(0,10);return Math.max(0,Math.ceil((Date.parse(d.desired_move_in_date+'T00:00:00Z')-Date.parse(submitted+'T00:00:00Z'))/86400000));}
  return windows[d.desired_move_in||row.when_needed]??null;
 }
 function flags(row){const d=details(row),days=urgency(d,row),v2=d.kind==='demand_validation_v2';
  const accepted=v2&&Number(d.quoted_price)>0&&['accept_ready','accept_visit'].includes(d.price_response);
  const qualified=v2&&Boolean(row.name&&row.phone)&&Array.isArray(d.storage_use_case)&&d.storage_use_case.length>0&&days!==null&&days<=90&&Boolean(d.expected_duration&&d.expected_duration!=='unsure');
  return {v2,days,qualified,accepted,ready:v2&&d.readiness_level==='ready_to_confirm',visit:v2&&d.readiness_level==='wants_visit'};
 }
 function uniqueContacts(rows){const map=new Map();for(const r of [...rows].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)||Number(b.id)-Number(a.id))){let phone=(r.phone||'').replace(/\D/g,'');if(phone.startsWith('66')&&phone.length===11)phone='0'+phone.slice(2);const key=phone||'lead:'+r.id;if(!map.has(key))map.set(key,r);}return [...map.values()];}
 function summary(rows){const v2=rows.filter(r=>details(r).kind==='demand_validation_v2'),people=uniqueContacts(v2),count=fn=>people.filter(r=>fn(flags(r),details(r))).length;return {submissions:v2.length,people:people.length,qualified:count(f=>f.qualified),within7:count(f=>f.days!==null&&f.days<=7),within30:count(f=>f.days!==null&&f.days<=30),within90:count(f=>f.days!==null&&f.days<=90),accepted:count(f=>f.accepted),ready:count(f=>f.ready),visit:count(f=>f.visit),readyOrVisit:count(f=>f.ready||f.visit),size34:count((f,d)=>d.requested_size==='3_4')};}
 const api={statuses,details,urgency,flags,uniqueContacts,summary};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BuddyDemand=api;
})(typeof window!=='undefined'?window:globalThis);
