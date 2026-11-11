import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const config=require('../demand-config.cjs');
const script=fs.readFileSync(new URL('../assets/registration.js',import.meta.url),'utf8');
const {priceFor,baht}=vm.runInNewContext(script.match(/^const baht=.*$/m)[0]+'\n'+script.match(/^function priceFor\(.*$/m)[0]+'\n({priceFor,baht})');
// Read-only snapshot of the Promo lab tab, approved by Newton 11 November 2026:
// https://docs.google.com/spreadsheets/d/1jze4VDORiCYvi30OKTmCVGyshNp_xpob5x-m1cPUMNc/edit#gid=9  (Promo lab!A10:P38) and Prices!A5:C13.
// discounts[i] = % off month i+1. Same discounts for every size. Each month rounds down to whole baht.
const sourcePlans=[
 {id:'monthly',pay:'monthly',months:1,discounts:[],deposit:1},
 {id:'upfront_3',pay:'upfront',months:3,discounts:[50],deposit:1},
 {id:'upfront_6',pay:'upfront',months:6,discounts:[50,50],deposit:1},
 {id:'upfront_12',pay:'upfront',months:12,discounts:[50,50,50,50,50],deposit:1},
 {id:'contract_3',pay:'monthly',months:3,discounts:[0,0,25],deposit:1},
 {id:'contract_6',pay:'monthly',months:6,discounts:[0,0,0,0,0,75],deposit:1},
 {id:'contract_12',pay:'monthly',months:12,discounts:[0,0,0,0,0,0,0,0,0,0,100,100],deposit:1},
 {id:'founding_3',pay:'upfront',months:3,discounts:[80],deposit:1},
 {id:'founding_6',pay:'upfront',months:6,discounts:[100,100],deposit:1},
 {id:'founding_12',pay:'upfront',months:12,discounts:[100,100,100,100,100],deposit:1}
];
const sourcePrices=[780,1990,3890,4590,4990,5790,6590,7290,8490];
test('all ten approved plans and nine list prices match the Promo lab snapshot',()=>{
 assert.deepEqual([...config.plans,...config.founding.plans],sourcePlans);
 assert.deepEqual([config.locker.monthly,...config.rooms.map(r=>r.monthly)],sourcePrices);
 assert.equal(config.founding.daysAfterOpening,14);
 assert.equal(config.founding.endsOn,null,'Founding stays open until the opening date is set');
 const pct=plan=>plan.discounts.reduce((a,b)=>a+b,0)/plan.months;
 for(const plan of config.founding.plans)assert(pct(plan)<=42,plan.id+' Founding stays near the 40% cap');
 for(const plan of config.plans)assert(pct(plan)<=21,plan.id+' Running stays within about 20%');
 for(const plan of config.plans.filter(p=>p.id.startsWith('contract_')))assert.equal(plan.discounts.findIndex(d=>d>0)+[...plan.discounts].reverse().filter(d=>d>0).length,plan.months,plan.id+' discount sits in the last months');
});
test('all 90 size-plan quotes preserve exact rent, list-rent deposit, savings and signing amount',()=>{
 for(const monthly of sourcePrices)for(const plan of sourcePlans){
  const q=priceFor({monthly},plan);
  const pays=Array.from({length:plan.months},(_,i)=>Math.floor(monthly*(100-(plan.discounts[i]||0))/100));
  const expected=pays.reduce((a,b)=>a+b,0);
  assert.equal(q.total,expected,monthly+' '+plan.id+' rent in whole baht');
  assert.deepEqual([...q.pays],pays);
  assert.equal(q.deposit,monthly,monthly+' '+plan.id+' deposit');
  assert.equal(q.atSigning,(plan.pay==='upfront'?q.total:pays[0])+monthly,'upfront pays all rent at signing; monthly pays the first month');
  assert.equal(q.saving,monthly*plan.months-q.total);
  assert.equal(q.average,q.total/plan.months);
 }
});
test('quotes match the Quote tab, rounding each month down (Newton, 11 Nov)',()=>{
 const plan=id=>sourcePlans.find(p=>p.id===id);
 assert.equal(priceFor({monthly:1990},plan('contract_3')).pays[2],1492,'1,990 x 75% = 1,492.50 rounds down');
 assert.equal(priceFor({monthly:1990},plan('contract_3')).total,5472);
 assert.equal(priceFor({monthly:1990},plan('contract_6')).pays[5],497);
 assert.equal(priceFor({monthly:1990},plan('contract_12')).total,19900);
 assert.equal(priceFor({monthly:1990},plan('founding_3')).total,4378);
 assert.equal(baht(priceFor({monthly:1990},plan('founding_6')).average),'฿1,327');
 assert.equal(baht(priceFor({monthly:1990},plan('founding_12')).average),'฿1,161');
 assert.equal(priceFor({monthly:1990},plan('upfront_3')).total,4975);
 assert.equal(priceFor({monthly:3890},plan('founding_3')).total,8558);
 assert.equal(priceFor({monthly:3890},plan('founding_12')).total,27230);
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
test('pay upfront is Founding until founding.endsOn, then Running upfront; pay monthly is always the contract',()=>{
 const run=(endsOn,mode,duration,kind='room')=>{const cfg={...config,founding:{...config.founding,endsOn}};const ctx={DEMAND_CONFIG:cfg,PLANS:Object.fromEntries([...cfg.plans,...cfg.founding.plans].map(p=>[p.id,p])),chosen:n=>n==='payment_mode'?mode:'',Date};vm.runInNewContext(script.match(/^function planFor\(.*$/m)[0]+';this.planFor=planFor;',ctx);return ctx.planFor({kind},duration)?.id;};
 assert.equal(run(null,'upfront','3_months'),'founding_3');assert.equal(run(null,'','6_months'),'founding_6','upfront is the default');assert.equal(run(null,'upfront','over_12_months','locker'),'founding_12','lockers get Founding too');
 assert.equal(run('2000-01-01','upfront','12_months'),'upfront_12','after Founding ends');assert.equal(run('2999-12-31','upfront','12_months'),'founding_12');
 for(const endsOn of [null,'2000-01-01'])assert.equal(run(endsOn,'monthly','6_months'),'contract_6');
 assert.equal(run(null,'monthly','1_month'),'monthly');assert.equal(run(null,'upfront','1_month'),'monthly','one month is never discounted');
});
