// Only activate prices explicitly approved by Newton. No inferred price ladder.
// Plans mirror the approved Promotions tab of the StorageBuddy Sales Toolkit sheet (verified 7 Nov 2026: all six plans Approved; one month of list rent as deposit).
// months = months of storage, paid = months charged, discount = % off the charged months, deposit = months of LIST rent, payable at signing. Free reservation collects nothing.
module.exports={version:'launch_2026_11_08_r7',location:'rama3',locker:{sqm:1,monthly:780,kind:'locker'},rooms:[{sqm:2,monthly:1990},{sqm:4,monthly:3990},{sqm:5,monthly:4590},{sqm:6,monthly:4990},{sqm:7,monthly:5790},{sqm:8,monthly:6590},{sqm:9,monthly:7290},{sqm:10,monthly:8490}],
plans:[{id:'monthly',months:1,paid:1,discount:0,deposit:1},{id:'prepay_3',months:3,paid:3,discount:5,deposit:1},{id:'prepay_6',months:6,paid:6,discount:10,deposit:1},{id:'prepay_12',months:12,paid:10,discount:0,deposit:1}],
founding:{rooms:30,daysAfterOpening:14,lockers:true,plans:[{id:'founding_6',months:6,paid:4,discount:0,deposit:1},{id:'founding_12',months:12,paid:7,discount:0,deposit:1}]},
opening:{th:'ต้นปี 2570',en:'early 2027',month:'2027-01'}};
