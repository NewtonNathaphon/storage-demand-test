import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const built=spawnSync(process.execPath,['build.cjs'],{cwd:root,encoding:'utf8',windowsHide:true});
assert.equal(built.status,0,built.stderr||built.stdout);
const publicDir=join(root,'public');
function htmlFiles(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?htmlFiles(join(dir,entry.name)):entry.name.endsWith('.html')?[join(dir,entry.name)]:[]);}
const visitorPages=htmlFiles(publicDir).filter(file=>!file.endsWith('backoffice.html')&&!file.includes('googlec5a82'));
const tagUrl='https://www.googletagmanager.com/gtag/js?id=AW-16778280533';
const sendTo='AW-16778280533/Kp7MCJaPm6gdENX8wMA-';

test('every visitor page has one tag directly after head and one conversion listener',()=>{
  assert.ok(visitorPages.length>=18);
  for(const file of visitorPages){
    const html=readFileSync(file,'utf8');
    assert.match(html,/<head(?:\s[^>]*)?>\s*<!-- Google tag \(gtag\.js\) -->/i,file);
    assert.equal(html.split(tagUrl).length-1,1,file);
    assert.equal(html.split(sendTo).length-1,1,file);
    assert.match(html,/gtag\('config', 'AW-16778280533'\)/,file);
  }
});

function loadedPage(file){
  const html=readFileSync(file,'utf8');
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match=>match[1]);
  const callbacks={};
  const timers=[];
  const assigned=[];
  class Element {closest(){return this.link;}}
  const page={URL,Date,Element,location:{href:'https://storagebuddyth.com/',assign:url=>assigned.push(url)},document:{addEventListener:(name,fn)=>callbacks[name]=fn},setTimeout:fn=>timers.push(fn)};
  page.window=page;
  vm.createContext(page);
  for(const script of scripts.filter(script=>script.includes('window.dataLayer')||script.includes('function trackLineClick')))vm.runInContext(script,page);
  return {page,callbacks,timers,assigned};
}

function click(state,href,target='_blank',type='click'){
  const element=new state.page.Element();
  element.link={href,target};
  let prevented=false;
  state.callbacks[type]({type,button:type==='auxclick'?1:0,target:element,defaultPrevented:false,ctrlKey:false,metaKey:false,shiftKey:false,altKey:false,preventDefault(){prevented=true;}});
  return prevented;
}

test('load does not convert; every real LINE link converts once and preserves new-tab navigation',()=>{
  for(const file of visitorPages){
    const html=readFileSync(file,'utf8');
    const links=[...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gi)].filter(match=>match[1].includes('line.me/R/ti/p/%40storagebuddy'));
    const state=loadedPage(file);
    assert.equal(state.page.dataLayer.filter(entry=>entry[0]==='event').length,0,file);
    for(const link of links){
      const target=link[0].match(/\btarget="([^"]+)"/)?.[1]||'';
      const prior=state.page.dataLayer.filter(entry=>entry[0]==='event').length;
      const prevented=click(state,link[1],target);
      assert.equal(state.page.dataLayer.filter(entry=>entry[0]==='event').length,prior+1,file);
      const event=state.page.dataLayer.at(-1);
      assert.equal(event[1],'conversion');
      assert.equal(event[2].send_to,sendTo);
      assert.equal(event[2].value,1);
      assert.equal(event[2].currency,'THB');
      assert.equal(prevented,target!=='_blank');
    }
  }
});

test('unrelated contacts do not convert; same-tab LINE handoff has a single fallback',()=>{
  const state=loadedPage(join(publicDir,'index.html'));
  for(const href of ['tel:+66628793645','mailto:hi@example.com','https://line.me/R/ti/p/%40someoneelse','https://notline.me/R/ti/p/%40storagebuddy'])click(state,href);
  assert.equal(state.page.dataLayer.filter(entry=>entry[0]==='event').length,0);
  assert.equal(click(state,'https://line.me/R/ti/p/%40storagebuddy',''),true);
  const conversion=state.page.dataLayer.at(-1)[2];
  conversion.event_callback();
  for(const timer of state.timers)timer();
  assert.deepEqual(state.assigned,['https://line.me/R/ti/p/%40storagebuddy']);
  assert.equal(click(state,'https://line.me/R/ti/p/%40storagebuddy','_blank','auxclick'),false);
  assert.equal(state.page.dataLayer.filter(entry=>entry[0]==='event').length,2);
});

test('existing Supabase contact click recording remains in homepage source',()=>{
  assert.match(readFileSync(join(root,'index.html'),'utf8'),/track\('contact_click',a\.dataset\.contact\)/);
});
