const satellite = require("./src/satellite");
const iridium = require("./src/iridium");

var location = [39.9042, 116.4074, "%E5%8C%97%E4%BA%AC%E5%B8%82", 52, "ChST"];
//COOKIE需要先通过浏览器调到中文

//const names = ["ISS", "IridiumFlares"];
// https://www.heavens-above.com/PassSummary.aspx?satid=41765&lat=0&lng=0&loc=Unspecified&alt=0&tz=UCT

satellite.getTable({
	target: 25544,
	pages: 4,
	root: "./public/data/"
}); //ISS
/*
iridium.getTable({
	pages: 4,
	root: "./public/data/"
});
*/
