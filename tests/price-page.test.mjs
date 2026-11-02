import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
execFileSync(process.execPath,['build.cjs'],{cwd:root});
const html=readFileSync(join(root,'public','price','index.html'),'utf8');
const config=require(join(root,'demand-config.cjs'));
const money=n=>'฿'+n.toLocaleString('en-US');

test('price page lists every approved price and nothing else',()=>{
  for(const room of config.rooms){assert.match(html,new RegExp(`data-size="${room.sqm}"[^>]*data-price="${room.monthly}"`));assert.ok(html.includes(money(room.monthly)),`missing ${room.sqm} sqm price`);}
  assert.ok(html.includes(money(config.locker.monthly)));
  assert.equal((html.match(/class="price-card"/g)||[]).length,config.rooms.length+1);
});

test('price page keeps Google Ads tag and the exact LINE link the conversion listens for',()=>{
  assert.match(html,/googletagmanager\.com\/gtag\/js\?id=AW-16778280533/);
  assert.match(html,/AW-16778280533\/Kp7MCJaPm6gdENX8wMA-/);
  const lineLinks=[...html.matchAll(/href="(https:\/\/line\.me[^"]*)"/g)].map(m=>m[1]);
  assert.ok(lineLinks.length>=3);
  for(const href of lineLinks)assert.equal(decodeURIComponent(new URL(href).pathname),'/R/ti/p/@storagebuddy');
});

test('price page stays out of search until opening and keeps pre-opening truthfulness',()=>{
  assert.match(html,/<meta name="robots" content="noindex,follow">/);
  assert.doesNotMatch(readFileSync(join(root,'public','sitemap.xml'),'utf8'),/\/price\//);
  assert.match(html,/คาดเปิดต้นปี 2570/);
  assert.match(html,/ไม่มีการชำระเงินในขั้นตอนนี้/);
  assert.doesNotMatch(html,/24\s*\/\s*7|CCTV|air[- ]?condition|ประกันภัย|พร้อมเข้าใช้|เปิดให้บริการแล้ว|available (?:now|today)/i);
});

test('short links redirect to the price page',()=>{
  const redirects=readFileSync(join(root,'public','_redirects'),'utf8');
  for(const line of ['/ratecard /price/ 301','/prices /price/ 301','/en/price /price/?lang=en 301'])assert.ok(redirects.includes(line),line);
});
