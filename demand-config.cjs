// Only activate prices explicitly approved by Newton. No inferred price ladder.
// Plans mirror the Promo lab tab of the StorageBuddy Sales Toolkit sheet (approved by Newton 11 Nov 2026). The same discounts apply to every size and the locker.
// Three campaigns: Founding (pay upfront, opening only), Running upfront (after Founding ends) and Running monthly (contract, pay each month, discount in the LAST months).
// discounts[i] = % off month i+1 (missing = 0). Each month rounds DOWN to whole baht (in the customer's favour). deposit = months of LIST rent, payable at signing. Free reservation collects nothing.
module.exports={version:'launch_2026_11_11_r9',location:'rama3',locker:{sqm:1,monthly:780,kind:'locker'},rooms:[{sqm:2,monthly:1990},{sqm:4,monthly:3890},{sqm:5,monthly:4590},{sqm:6,monthly:4990},{sqm:7,monthly:5790},{sqm:8,monthly:6590},{sqm:9,monthly:7290},{sqm:10,monthly:8490}],
plans:[{id:'monthly',pay:'monthly',months:1,discounts:[],deposit:1},
{id:'upfront_3',pay:'upfront',months:3,discounts:[50],deposit:1},{id:'upfront_6',pay:'upfront',months:6,discounts:[50,50],deposit:1},{id:'upfront_12',pay:'upfront',months:12,discounts:[50,50,50,50,50],deposit:1},
{id:'contract_3',pay:'monthly',months:3,discounts:[0,0,25],deposit:1},{id:'contract_6',pay:'monthly',months:6,discounts:[0,0,0,0,0,75],deposit:1},{id:'contract_12',pay:'monthly',months:12,discounts:[0,0,0,0,0,0,0,0,0,0,100,100],deposit:1}],
// endsOn: last day of Founding (opening date + 14 days, YYYY-MM-DD). null = still open (before opening). After it, pay-upfront quotes switch to the Running upfront plans automatically.
founding:{rooms:30,daysAfterOpening:14,endsOn:null,lockers:true,plans:[{id:'founding_3',pay:'upfront',months:3,discounts:[80],deposit:1},{id:'founding_6',pay:'upfront',months:6,discounts:[100,100],deposit:1},{id:'founding_12',pay:'upfront',months:12,discounts:[100,100,100,100,100],deposit:1}]},
opening:{th:'ต้นปี 2570',en:'early 2027',month:'2027-01'}};
