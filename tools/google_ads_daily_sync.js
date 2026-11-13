// StorageBuddy: send Google Ads daily numbers to the back office every hour.
// Where: Google Ads -> Tools -> Bulk actions -> Scripts -> + New script. Paste this whole file.
// 1. Replace PASTE_YOUR_SECRET_HERE with the same secret you saved in Cloudflare as ADS_INGEST_TOKEN.
// 2. Click Authorize, then Preview (the log should say "Sent N days: HTTP 200"), then Save.
// 3. Set Frequency to Hourly.
// It sends the last 30 days each time, so Google's late corrections are picked up. It never changes your ads.
const ENDPOINT='https://storagebuddyth.com/api/ads-ingest';
const TOKEN='PASTE_YOUR_SECRET_HERE';
function main(){
  const currency=AdsApp.currentAccount().getCurrencyCode();
  const days={};
  const blank=d=>({day:d,impressions:0,clicks:0,cost_thb:0,conversions:0,line_clicks:0,reservations:0,quote_requests:0});
  const totals=AdsApp.search('SELECT segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM customer WHERE segments.date DURING LAST_30_DAYS');
  while(totals.hasNext()){
    const r=totals.next(),d=r.segments.date;days[d]=days[d]||blank(d);
    days[d].impressions+=Number(r.metrics.impressions||0);days[d].clicks+=Number(r.metrics.clicks||0);
    days[d].cost_thb+=Number(r.metrics.costMicros||0)/1e6;days[d].conversions+=Number(r.metrics.conversions||0);
  }
  const actions=AdsApp.search('SELECT segments.date, segments.conversion_action_name, metrics.all_conversions FROM customer WHERE segments.date DURING LAST_30_DAYS');
  while(actions.hasNext()){
    const r=actions.next(),d=r.segments.date,name=String(r.segments.conversionActionName||'').toLowerCase(),n=Number(r.metrics.allConversions||0);
    days[d]=days[d]||blank(d);
    if(name.indexOf('line')>=0)days[d].line_clicks+=n;else if(name.indexOf('reservation')>=0)days[d].reservations+=n;else if(name.indexOf('quote')>=0)days[d].quote_requests+=n;
  }
  const rows=Object.keys(days).map(d=>{const r=days[d];r.cost_thb=Math.round(r.cost_thb*100)/100;r.channel='google_ads';r.currency=currency;return r;});
  if(!rows.length){Logger.log('No Google Ads activity in the last 30 days.');return;}
  const res=UrlFetchApp.fetch(ENDPOINT,{method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+TOKEN},payload:JSON.stringify({rows:rows}),muteHttpExceptions:true});
  Logger.log('Sent '+rows.length+' days: HTTP '+res.getResponseCode()+' '+res.getContentText().slice(0,200));
  if(res.getResponseCode()!==200)throw new Error('Back office did not accept the data: '+res.getContentText().slice(0,200));
}
