import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';

const root=new URL('..',import.meta.url).pathname;
const illustrations=['buddy_hero_banner3','buddy_size_advisor_v2','buddy_support'];
const widths=[640,1280];
const originalHashes={
  buddy_hero_banner3:'c96f4956fa014db802ed620698feceb2f07556968b071c6547b826a2eea465ea',
  buddy_size_advisor_v2:'01e3823640c5a07597e64497dc30a407f7ed2e20898915f215db899ccc662f7a',
  buddy_support:'1b59cc7399143140cbcd9c5624f751421034206c9304b4f5d888c40eb89172b0'
};

const built=spawnSync(process.execPath,['build.cjs'],{cwd:root,encoding:'utf8'});
assert.equal(built.status,0,built.stderr||built.stdout);
const thai=readFileSync(join(root,'public/index.html'),'utf8');
const english=readFileSync(join(root,'public/en/index.html'),'utf8');

const pictureFor=(html,alt)=>{
  const match=html.match(new RegExp(`<picture[^>]*>[\\s\\S]*?<img[^>]+alt=["']${alt}["'][^>]*>[\\s\\S]*?<\\/picture>`,'i'));
  assert.ok(match,`missing picture for ${alt}`);
  return match[0];
};

test('responsive WebP illustrations are generated and published',()=>{
  for(const name of illustrations){
    const png=join(root,'assets',`${name}.png`);
    assert.ok(existsSync(png),`rollback fallback missing: ${name}.png`);
    for(const width of widths){
      const relative=`assets/${name}-${width}.webp`;
      const source=join(root,relative);
      const published=join(root,'public',relative);
      assert.ok(existsSync(source),`missing ${relative}`);
      assert.ok(existsSync(published),`build omitted ${relative}`);
      assert.ok(statSync(source).size<statSync(png).size,`${relative} must be smaller than its PNG fallback`);
      assert.ok(statSync(source).size<350_000,`${relative} exceeds the 350 KB performance budget`);
    }
  }
});

test('homepage variants serve responsive images with safe PNG fallbacks',()=>{
  for(const [html,advisorAlt] of [[thai,'บัดดี้ช่วยลูกค้าเลือกขนาดพื้นที่เก็บของ'],[english,'A Buddy advisor helping a customer choose storage space']]){
    const hero=pictureFor(html,'StorageBuddy');
    assert.match(hero,/type=["']image\/webp["'][^>]+srcset=["'][^"']*buddy_hero_banner3-640\.webp 640w,[^"']*buddy_hero_banner3-1280\.webp 1280w/i);
    assert.match(hero,/<img[^>]+src=["'][^"']*buddy_hero_banner3\.png["'][^>]+fetchpriority=["']high["'][^>]+decoding=["']async["']/i);
    assert.doesNotMatch(hero,/loading=["']lazy["']/i);

    for(const [name,alt] of [['buddy_size_advisor_v2',advisorAlt],['buddy_support','StorageBuddy helps plan the right storage size'],['buddy_support','StorageBuddy support']]){
      const picture=pictureFor(html,alt);
      assert.match(picture,new RegExp(`type=["']image/webp["'][^>]+srcset=["'][^"']*${name}-640\\.webp 640w,[^"']*${name}-1280\\.webp 1280w`,'i'));
      assert.match(picture,new RegExp(`<img[^>]+src=["'][^"']*${name}\\.png["'][^>]+loading=["']lazy["'][^>]+decoding=["']async["']`,'i'));
    }
  }
});

test('optimization is rollback-safe and does not mutate original artwork',()=>{
  for(const name of illustrations){
    const original=readFileSync(join(root,'assets',`${name}.png`));
    const actual=createHash('sha256').update(original).digest('hex');
    assert.equal(actual,originalHashes[name],`${name}.png differs from its verified original hash`);
  }
});

test('build does not publish unused multi-megabyte artwork',()=>{
  for(const name of ['buddy_hero_banner2.png','buddy_opening_promo.png','buddy_room_advice.png','buddy_room_advice_v4.png','buddy_size_advisor.png']){
    assert.equal(existsSync(join(root,'public/assets',name)),false,`unused ${name} should not ship`);
  }
});
