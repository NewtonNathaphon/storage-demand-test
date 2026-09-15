import {fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';

const root=fileURLToPath(new URL('..',import.meta.url));
const sourcePath=join(root,'404.html');
const publicPath=join(root,'public','404.html');
const lineUrl='https://line.me/R/ti/p/%40storagebuddy';

const visibleText=source=>source
  .replace(/<(script|style|svg|template)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
  .replace(/<!--([\s\S]*?)-->/g,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/\s+/g,' ')
  .trim();

test('branded bilingual 404 source is safe and truthful',()=>{
  assert.equal(existsSync(sourcePath),true,'missing top-level 404.html source');
  const source=readFileSync(sourcePath,'utf8');
  const text=visibleText(source);

  assert.match(source,/<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["'][^>]*>/i);
  assert.doesNotMatch(source,/<link[^>]+rel=["']canonical["']/i,'404 must not claim a canonical valid-page URL');
  assert.match(source,/assets\/storagebuddy_logo_20260912\.png/);
  assert.match(text,/ไม่พบหน้าที่คุณต้องการ/);
  assert.match(text,/Page not found/i);

  for(const href of ['/', '/en/', '/sizes/', '/location/rama-3/', lineUrl]){
    assert.match(source,new RegExp(`href=["']${href.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']`),`missing navigation link: ${href}`);
  }
  for(const label of ['หน้าแรกภาษาไทย','English home','คู่มือขนาด','แผนพื้นที่พระราม 3','LINE'])assert.match(text,new RegExp(label,'i'));

  assert.doesNotMatch(text,/24\s*\/\s*7|CCTV|air[- ]?condition|ประกันภัย|พร้อมเข้าใช้|เปิดให้บริการแล้ว|available (?:now|today)|ราคาเริ่ม|starting (?:at|from)|฿\s*\d|จองเลย|book now/i);
  assert.doesNotMatch(source,/\.md\b|\.sql\b|\.env\b|supabase|service[_-]?role|api[_-]?key|authorization\s*:/i);
  assert.doesNotMatch(source,/<script\b|<form\b/i,'404 should remain a static, non-collecting page');
});

test('allowlisted build publishes only the intended 404 source',()=>{
  const buildSource=readFileSync(join(root,'build.cjs'),'utf8');
  assert.match(buildSource,/allowlist\s*=\s*\[[\s\S]*?["']404\.html["']/,'404.html must be explicitly allowlisted');

  const built=spawnSync(process.execPath,['build.cjs'],{cwd:root,encoding:'utf8'});
  assert.equal(built.status,0,built.stderr||built.stdout);
  assert.equal(existsSync(publicPath),true,'build did not publish public/404.html');
  assert.equal(readFileSync(publicPath,'utf8'),readFileSync(sourcePath,'utf8'),'published 404 must exactly match its source');
});
