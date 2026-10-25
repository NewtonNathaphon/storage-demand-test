// Inject the same Google Ads tag into every public HTML page at build time.
// The lead-form consent checkboxes are for contacting a lead, not ad consent.
const GOOGLE_TAG=`
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-16778280533"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-16778280533');
</script>
<script>
(function(){
  function trackLineClick(event){
    if(event.defaultPrevented || (event.type==='auxclick' && event.button!==1))return;
    const link=event.target instanceof Element?event.target.closest('a[href]'):null;
    if(!link)return;
    let url;
    try{url=new URL(link.href,location.href);}catch{return;}
    if(url.protocol!=='https:' || url.hostname!=='line.me' || decodeURIComponent(url.pathname)!=='/R/ti/p/@storagebuddy')return;

    const sameTab=event.type==='click' && event.button===0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && (!link.target || link.target==='_self');
    const conversion={send_to:'AW-16778280533/Kp7MCJaPm6gdENX8wMA-',value:1.0,currency:'THB'};
    if(!sameTab){gtag('event','conversion',conversion);return;}

    // Keep this tab alive until Google acknowledges the event, with a fallback
    // so a blocked tag or mobile handoff never traps the visitor on this page.
    event.preventDefault();
    let navigated=false;
    const navigate=()=>{if(!navigated){navigated=true;location.assign(link.href);}};
    gtag('event','conversion',{...conversion,event_callback:navigate,event_timeout:700});
    setTimeout(navigate,800);
  }
  document.addEventListener('click',trackLineClick);
  document.addEventListener('auxclick',trackLineClick);
})();
</script>`;

function installGoogleAds(html){
  if(/googletagmanager\.com\/gtag\/js|gtag\s*\(\s*['"]config['"]/.test(html))throw new Error('Google tag already exists in this page');
  if(!/<head(?:\s[^>]*)?>/i.test(html))throw new Error('Missing head element for Google tag');
  return html.replace(/<head(?:\s[^>]*)?>/i,match=>match+GOOGLE_TAG);
}

module.exports={installGoogleAds};
