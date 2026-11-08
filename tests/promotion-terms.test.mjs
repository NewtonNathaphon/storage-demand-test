import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const config=require('../demand-config.cjs');
const script=fs.readFileSync(new URL('../assets/registration.js',import.meta.url),'utf8');
const {priceFor,baht}=vm.runInNewContext(script.match(/^const baht=.*$/m)[0]+'\n'+script.match(/^function priceFor\(.*$/m)[0]+'\n({priceFor,baht})');
// Read-only snapshot, verified 7 November 2026:
// https://docs.google.com/spreadsheets/d/1jze4VDORiCYvi30OKTmCVGyshNp_xpob5x-m1cPUMNc/edit#gid=1
// Promotions!A5:I10 and Prices!A5:C13. Quote!B16:B20 defines the exact arithmetic.
const sourcePlans=[
 {id:'monthly',months:1,paid:1,discount:0,deposit:1},
 {id:'prepay_3',months:3,paid:3,discount:5,deposit:1},
 {id:'prepay_6',months:6,paid:6,discount:10,deposit:1},
 {id:'prepay_12',months:12,paid:10,discount:0,deposit:1},
 {id:'founding_6',months:6,paid:4,discount:0,deposit:1},
 {id:'founding_12',months:12,paid:7,discount:0,deposit:1}
];
const sourcePrices=[780,1990,3990,4590,4990,5790,6590,7290,8490];
test('all six approved plans and nine list prices match the live sheet snapshot',()=>{
 assert.deepEqual([...config.plans,...config.founding.plans],sourcePlans);
 assert.deepEqual([config.locker.monthly,...config.rooms.map(r=>r.monthly)],sourcePrices);
 assert.equal(config.founding.rooms,30);
 assert.equal(config.founding.daysAfterOpening,14);
});
test('all 54 size-plan quotes preserve exact rent, list-rent deposit, savings and signing amount',()=>{
 for(const monthly of sourcePrices)for(const plan of sourcePlans){
  const q=priceFor({monthly},plan);
  const expected=Math.round(monthly*plan.paid*(100-plan.discount)/100);
  assert.equal(q.total,expected,monthly+' '+plan.id+' rent in whole baht');
  assert.equal(q.deposit,monthly,monthly+' '+plan.id+' deposit');
  assert.equal(q.atSigning,q.total+monthly);
  assert.equal(q.saving,monthly*plan.months-q.total);
  assert.equal(q.average,q.total/plan.months);
 }
});
test('quotes round to whole baht with normal rounding (Newton, 7 Nov)',()=>{
 const q=priceFor({monthly:3990},sourcePlans[1]);
 assert.equal(q.total,11372);assert.equal(q.saving,598);assert.equal(baht(q.total),'฿11,372');assert.equal(baht(q.average),'฿3,791');
 assert.equal(baht(priceFor({monthly:3990},sourcePlans[5]).average),'฿2,328');assert.equal(baht(priceFor({monthly:2490},sourcePlans[1]).total),'฿7,097');
});
test('public terms distinguish free reservation from signing and disclose promotion limits',()=>{
 assert.match(script,/t\('เงินประกัน','Deposit'\),t\('1 เดือน','1 month'\)/,'deposit shown as its own line');assert.doesNotMatch(script,/Due when you sign|Due at signing/,'deposit is not added to the rent');
 assert.match(script,/limited, first come first served/);assert.doesNotMatch(script,/first \$\{DEMAND_CONFIG.founding.rooms\} rooms|\$\{DEMAND_CONFIG.founding.rooms\} ห้องแรก/,'Newton: never show the room quota to customers');
 assert.match(script,/\$\{DEMAND_CONFIG.founding.daysAfterOpening\} days after opening/);
 assert.match(script,/This price covers the first 12 months/);
 assert.match(script,/continue monthly at the standard price/,'Newton-approved renewal wording');assert.doesNotMatch(script,/round down to the whole baht/);
 assert.match(script,/price_shown:q\?Math.round/,'legacy integer column stays safe while exact quote is in customer_use');
 for(const file of ['index.html','registration-page.cjs','seo-pages.cjs']){
  const s=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
  assert.match(s,/one month of list rent/i,file);
  assert.match(s,/เงินประกันเท่ากับค่าเช่าปกติ 1 เดือน/,file);
 }
});
