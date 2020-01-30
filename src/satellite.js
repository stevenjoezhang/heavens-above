const request = require("request");
const cheerio = require("cheerio");
const async = require("async");
const fs = require("fs");
const base = require("./base");

const property = ["url", "date", "brightness", "events", "passType", "image", "scoreData", "exist", "score", "id"];
const events = ["rise", "reachAltitude10deg", "highestPoint", "dropBelowAltitude10deg", "set", "exitShadow", "enterShadow"];
const attribute = ["time", "altitude", "azimuth", "distance", "brightness", "sunAltitude"];

var compare = [
	function(a, b) {
		return a[property[6]][1] >= b[property[6]][1] ? 1 : -1; //星等（越小越好）
	},
	function(a, b) {
		return a[property[6]][2] >= b[property[6]][2] ? 1 : -1; //太阳高度（越小越好）
	},
	function(a, b) {
		return a[property[6]][3] <= b[property[6]][3] ? 1 : -1; //卫星高度（越大越好）
	},
	function(a, b) {
		return a[property[7]] <= b[property[7]] ? 1 : -1; //持续时间（越大越好）
	}
];
var weight = [9.5, 6, 6.5, 6.5];

function getTable(config) {
	var database = config.database || [];
	var counter = config.counter || 0;
	var opt = config.opt || 0;
	var basedir = `${config.root}satellite${config.target}/`;
	if (counter === 0) {
		options = base.get_options(`PassSummary.aspx?satid=${config.target}&`);
		if (!fs.existsSync(basedir)) {
			fs.mkdir(basedir, (err) => {
				if (err) console.log(err);
			});
		}
	} else {
		options = base.post_options(`PassSummary.aspx?satid=${config.target}&`, opt);
	}
	request(options, (error, response, body) => { //请求成功的处理逻辑
		if (!error && response.statusCode === 200) {
			var $ = cheerio.load(body, {
				decodeEntities: false
			});
			var next = "__EVENTTARGET=&__EVENTARGUMENT=&__LASTFOCUS=";
			var tbody = $("form").find("table.standardTable tbody");
			var queue = [];
			tbody.find("tr").each((i, o) => {
				queue.push({
					[property[0]]: "https://www.heavens-above.com/" + $(o).find("td").eq(0).find("a").attr("href").replace("type=V", "type=A"),
					[property[1]]: $(o).find("td").eq(0).find("a").text(),
					[property[2]]: $(o).find("td").eq(1).text(),
					[property[3]]: {},
					[property[4]]: $(o).find("td").eq(11).text()
				});
			});
			async.map(queue, function(temp, finish) {
				request(base.image_options(temp[property[0]]), (error, response, body) => {
					if (!error && response.statusCode === 200) {
						var $ = cheerio.load(body, {
								decodeEntities: false
							}),
							table = $("form").find("table.standardTable"),
							tbody = table.find("tbody"),
							shift = 0,
							score = 0,
							flag = false; //防止i - shift === 2触发两次的问题
						for (var i = 0; i < tbody.find("tr").length; i++) {
							if (tbody.find("tr").eq(i).find("td").eq(0).text() === "离开地影") { //Exits shadow
								temp[property[3]][events[5]] = {};
								current = temp[property[3]][events[5]];
								shift++;
							} else if (tbody.find("tr").eq(i).find("td").eq(0).text() === "进入地影") { //Enters shadow
								temp[property[3]][events[6]] = {};
								current = temp[property[3]][events[6]];
								shift++;
							} else {
								temp[property[3]][events[i - shift]] = {};
								current = temp[property[3]][events[i - shift]];
							}
							for (var j = 0; j < 6; j++) {
								current[attribute[j]] = tbody.find("tr").eq(i).find("td").eq(j + 1).text();
							}
							if (i - shift === 2 && !flag) { //防止因为网站上表格顺序打乱而获得错误的数据
								flag = true;
								var hours = parseInt(current[attribute[0]].split(":")[0]),
									mag = parseFloat(current[attribute[4]]),
									sunalt = parseFloat(current[attribute[5]].split("°")[0]),
									alt = parseInt(current[attribute[1]].split("°")[0]);
							}
						}
						var startTime = base.getTimestamp(temp[property[3]][events[5]] ? temp[property[3]][events[5]][attribute[0]] : temp[property[3]][events[1]][attribute[0]]);
						var endTime = base.getTimestamp(temp[property[3]][events[6]] ? temp[property[3]][events[6]][attribute[0]] : temp[property[3]][events[3]][attribute[0]]);
						temp[property[5]] = "https://www.heavens-above.com/" + $("#ctl00_cph1_imgViewFinder").attr("src") //.replace("size=800", "size=1600");
						temp[property[6]] = [hours, mag, sunalt, alt];
						temp[property[7]] = endTime - startTime;
						temp[property[8]] = 0;
						var id = base.md5(Math.random().toString()) //temp[property[1]] + temp[property[7]];
						temp[property[9]] = id;
						fs.appendFile(basedir + id + ".html", table.html(), (err) => {
							if (err) console.log(err);
						}); //保存表格
						request.get(base.image_options(temp[property[5]])).pipe(fs.createWriteStream(basedir + id + ".png", {
							"flags": "a"
						})).on("error", (err) => {
							console.error(err);
						}); //下载图片
						console.log(temp);
						finish(null, temp);
					}
				});
			}, (errs, results) => {
				if (errs) throw errs; // errs = [err1, err2, err3]
				//console.log(results); // results = [result1, result2, result3]
				database = database.concat(results);
				$("form").find("input").each((i, o) => {
					if ($(o).attr("name") === "ctl00$cph1$btnPrev" || $(o).attr("name") === "ctl00$cph1$visible") return;
					else next += `&${$(o).attr("name")}=${$(o).attr("value")}`;
				});
				next += "&ctl00$cph1$visible=radioVisible";
				next = next.replace(/\+/g, "%2B").replace(/\//g, "%2F") //.replace(/\$/g, "%24");
				if (counter < config.count) {
					getTable({
						target: config.target,
						count: config.count,
						root: config.root,
						counter: ++counter,
						opt: next,
						database: database
					});
				} else {
					for (var i = 0; i < 4; i++) {
						database.sort(compare[i]);
						database = database.map((ele, index) => {
							ele[property[8]] += 100 * (1 - index / database.length) * weight[i];
							return ele;
						});
					}
					database = database.map((ele, index) => {
						if (isNaN(ele[property[6]][1])) {
							ele[property[8]] = 0;
							return ele;
						} //上中天没有星等直接归零
						if (ele[property[6]][0] >= 17 && ele[property[6]][0] <= 19) {
							ele[property[8]] += 850;
						} else if (ele[property[6]][0] >= 20 && ele[property[6]][0] <= 23) {
							ele[property[8]] += 950;
						} else if (ele[property[6]][0] >= 0 && ele[property[6]][0] <= 3) {
							ele[property[8]] += 400;
						} else if (ele[property[6]][0] >= 4 && ele[property[6]][0] <= 6) {
							ele[property[8]] += 300;
						}
						ele[property[8]] = Math.floor(ele[property[8]] / 40);
						return ele;
					});
					database.sort((a, b) => {
						return a[property[8]] <= b[property[8]] ? 1 : -1; //分数
					});
					fs.appendFile(basedir + "index.json", JSON.stringify(database), (err) => {
						if (err) console.log(err);
					});
				}
			});
		}
	});
}

exports.getTable = getTable;
