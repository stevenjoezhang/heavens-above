const satellite = require('./satellite.js');
const iridium = require('./iridium.js');

const names = ["ISS", "TianGong", "IridiumFlares"];
const count = 4;
var database = [];
//https://www.heavens-above.com/PassSummary.aspx?satid=41765&lat=0&lng=0&loc=Unspecified&alt=0&tz=UCT

//satellite.getTable(database, 25544, 0);
//satellite.getTable(database, 41765, 0);
iridium.getTable(database, "", 0);

console.log(database);
/*
评价参数：

最高点星等（越亮越好）

x>-2 0
-(x+2)*50
x<-4 100

最高点高度角（越高越好）
x/90*100

最高点时间（避免凌晨）
17-23 100

总持续时间

*/
