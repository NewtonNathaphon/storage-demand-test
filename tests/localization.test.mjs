import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';
import localization from '../html-localization.cjs';

const {localizeHtml}=localization;
const root=new URL('..',import.meta.url).pathname;

const build=()=>{
  const result=spawnSync(process.execPath,['build.cjs'],{cwd:root,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
};
const walk=dir=>readdirSync(dir).flatMap(name=>{
  const file=join(dir,name);
  return statSync(file).isDirectory()?walk(file):[file];
});
const snapshot=dir=>Object.fromEntries(walk(dir).sort().map(file=>[
  relative(dir,file),
  createHash('sha256').update(readFileSync(file)).digest('hex')
]));
const rawBlocks=(source,tag)=>[...source.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}\\s*>`,'gi'))].map(match=>match[1]);
const openingTags=source=>{
  const tags=[];
  let index=0;
  while(index<source.length){
    const start=source.indexOf('<',index);
    if(start<0)break;
    if(source.startsWith('<!--',start)){
      const end=source.indexOf('-->',start+4);
      index=end<0?source.length:end+3;
      continue;
    }
    let end=start+1,quote=null;
    for(;end<source.length;end++){
      const char=source[end];
      if(quote){if(char===quote)quote=null;continue;}
      if(char==='"'||char==="'"){quote=char;continue;}
      if(char==='>')break;
    }
    const token=source.slice(start,end+1);
    if(/^<[a-z]/i.test(token))tags.push(token);
    index=end+1;
  }
  return tags;
};
const attributes=tag=>{
  const result={};
  const body=tag.replace(/^<\s*[^\s/>]+/,'').replace(/\/?>$/,'');
  const pattern=/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for(const match of body.matchAll(pattern))result[match[1].toLowerCase()]=match[2]??match[3]??match[4]??true;
  return result;
};
const sortedUnique=values=>[...new Set(values)].sort();

build();
const thai=readFileSync(join(root,'public/index.html'),'utf8');
const english=readFileSync(join(root,'public/en/index.html'),'utf8');

test('nested repeated tags localize without damaging structure or unrelated text',()=>{
  const fixture='<main><div id="outer" data-en="Outer">ไทยนอก<div id="inner" data-en="Inner">ไทยใน <span id="kept">KEEP &amp; SAFE</span></div><p id="later">LATER TEXT</p></div><div id="after">AFTER TEXT</div></main>';
  const actual=localizeHtml(fixture);
  assert.equal(actual,'<main><div id="outer" data-en="Outer">Outer<div id="inner" data-en="Inner">Inner <span id="kept">KEEP &amp; SAFE</span></div><p id="later">LATER TEXT</p></div><div id="after">AFTER TEXT</div></main>');
});

test('script and style bodies are preserved byte-for-byte',()=>{
  const fixture='<style>.x::after{content:"<div data-en=\\"bad\\">"}</style><div data-en="Good">ไทย</div><script>const template=`<span data-en="bad">ไทย</span>`;</script>';
  const actual=localizeHtml(fixture);
  assert.deepEqual(rawBlocks(actual,'style'),rawBlocks(fixture,'style'));
  assert.deepEqual(rawBlocks(actual,'script'),rawBlocks(fixture,'script'));
  assert.match(actual,/<div data-en="Good">Good<\/div>/);

  assert.deepEqual(rawBlocks(english,'style'),rawBlocks(thai,'style'));
  const thaiScripts=rawBlocks(thai,'script');
  const englishScripts=rawBlocks(english,'script');
  assert.equal(englishScripts.length,thaiScripts.length);
  assert.deepEqual(englishScripts,thaiScripts.map(body=>body.replace("const pathLanguage='th';","const pathLanguage='en';")));
});

test('English build preserves IDs, controls, dialogs and inline script count',()=>{
  const structure=source=>{
    const tags=openingTags(source);
    const parsed=tags.map(tag=>({tag:tag.match(/^<\s*([^\s/>]+)/)[1].toLowerCase(),attrs:attributes(tag)}));
    return {
      ids:sortedUnique(parsed.flatMap(item=>typeof item.attrs.id==='string'?[item.attrs.id]:[])),
      controls:parsed.filter(item=>['button','input','select','textarea'].includes(item.tag)).map(item=>JSON.stringify({tag:item.tag,id:item.attrs.id??null,name:item.attrs.name??null,type:item.attrs.type??null,required:'required' in item.attrs})).sort(),
      dialogs:parsed.filter(item=>item.tag==='dialog').map(item=>item.attrs.id??null).sort(),
      inlineScripts:parsed.filter(item=>item.tag==='script'&&!('src' in item.attrs)).length
    };
  };
  assert.deepEqual(structure(english),structure(thai));
});

test('build is byte-identical when run twice',()=>{
  const first=snapshot(join(root,'public'));
  build();
  assert.deepEqual(snapshot(join(root,'public')),first);
});

test('localized attributes preserve safe HTML entity encoding',()=>{
  const fixture='<input id="x" placeholder="ไทย &amp; เดิม" data-en-placeholder="Boxes &amp; &quot;crates&quot;"><img id="y" alt="ไทย" data-en-alt="Buddy &amp; boxes"><button id="z" aria-label="ไทย" data-en-aria-label="Save &quot;now&quot; &amp; later">ไทย</button>';
  const actual=localizeHtml(fixture);
  assert.match(actual,/placeholder="Boxes &amp; &quot;crates&quot;"/);
  assert.match(actual,/alt="Buddy &amp; boxes"/);
  assert.match(actual,/aria-label="Save &quot;now&quot; &amp; later"/);
  assert.doesNotMatch(actual,/placeholder="Boxes & crates"|&amp;amp;|aria-label="Save "now"/);
});

test('localized attributes encode a double-quote target delimiter',()=>{
  const fixture='<input placeholder="ไทย" data-en-placeholder=\'Say "hi" &amp; keep &quot;this&quot;\'>';
  const actual=localizeHtml(fixture);
  assert.equal(actual,'<input placeholder="Say &quot;hi&quot; &amp; keep &quot;this&quot;" data-en-placeholder=\'Say "hi" &amp; keep &quot;this&quot;\'>');
  assert.doesNotMatch(actual,/&amp;(?:amp;)?quot;/);
});

test('localized attributes encode a single-quote target delimiter',()=>{
  const fixture='<input placeholder=\'ไทย\' data-en-placeholder="Buddy\'s boxes &amp; owner&#39;s crates">';
  const actual=localizeHtml(fixture);
  assert.equal(actual,'<input placeholder=\'Buddy&#39;s boxes &amp; owner&#39;s crates\' data-en-placeholder="Buddy\'s boxes &amp; owner&#39;s crates">');
  assert.doesNotMatch(actual,/&amp;#39;/);
});

test('localized attributes promote an unquoted target when the translation contains spaces',()=>{
  const fixture='<input placeholder=x data-en-placeholder="two words">';
  const actual=localizeHtml(fixture);
  assert.equal(actual,'<input placeholder="two words" data-en-placeholder="two words">');
});

test('localized attributes safely encode delimiters when promoting an unquoted target',()=>{
  const fixture='<input placeholder=x data-en-placeholder=\'Use > &amp; "quotes" and &quot;entities&quot;\'>';
  const actual=localizeHtml(fixture);
  assert.equal(actual,'<input placeholder="Use > &amp; &quot;quotes&quot; and &quot;entities&quot;" data-en-placeholder=\'Use > &amp; "quotes" and &quot;entities&quot;\'>');
  assert.doesNotMatch(actual,/&amp;amp;|&amp;quot;/);
});
