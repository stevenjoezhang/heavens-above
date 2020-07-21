const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const utils = require("./utils");

const property = ["url", "date", "brightness", "events", "passType", "image", "scoreData", "exist", "score", "id"];
const events = ["rise", "reachAltitude10deg", "highestPoint", "dropBelowAltitude10deg", "set", "exitShadow", "enterShadow"];
const attribute = ["time", "altitude", "azimuth", "distance", "brightness", "sunAltitude"];

const compare = [
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
const weight = [9.5, 6, 6.5, 6.5];

function getTable(config) {
	let database = config.database || [];
	let counter = config.counter || 0;
	const opt = config.opt || 0;
	const basedir = `${config.root}satellite${config.target}/`;
	if (counter === 0) {
		options = utils.get_options(`PassSummary.aspx?satid=${config.target}&`);
		if (!fs.existsSync(basedir)) {
			fs.mkdir(basedir, (err) => {
				if (err) console.log(err);
			});
		}
	} else {
		options = utils.post_options(`PassSummary.aspx?satid=${config.target}&`, opt);
	}
	request(options, (error, response, body) => {
		if (error || response.statusCode !== 200) return;
		const $ = cheerio.load(body, {
			decodeEntities: false
		});
		let next = "__EVENTTARGET=&__EVENTARGUMENT=&__LASTFOCUS=";
		const tbody = $("form").find("table.standardTable tbody");
		const queue = [];
		tbody.find("tr").each((i, o) => {
			queue.push({
				[property[0]]: "https://www.heavens-above.com/" + $(o).find("td").eq(0).find("a").attr("href").replace("type=V", "type=A"),
				[property[1]]: $(o).find("td").eq(0).find("a").text(),
				[property[2]]: $(o).find("td").eq(1).text(),
				[property[3]]: {},
				[property[4]]: $(o).find("td").eq(11).text()
			});
		});
		function factory(temp) {
			return new Promise((resolve, reject) => {
				request(utils.image_options(temp[property[0]]), (error, response, body) => {
                    if (error || response.statusCode !== 200) {
						reject(error);
						return;
					}
                    console.log("Success", temp);

                    const $ = cheerio.load(body, {
						decodeEntities: false
					}); //防止i - shift === 2触发两次的问题

                    const table = $("form").find("table.standardTable");
                    const tbody = table.find("tbody");
                    let shift = 0;
					let flag = false;
					const data = [];
                    for (let i = 0; i < tbody.find("tr").length; i++) {
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
						for (let j = 0; j < 6; j++) {
							current[attribute[j]] = tbody.find("tr").eq(i).find("td").eq(j + 1).text();
						}
						if (i - shift === 2 && !flag) { //防止因为网站上表格顺序打乱而获得错误的数据
							flag = true;
							data[0] = parseInt(current[attribute[0]].split(":")[0]);
							data[1] = parseFloat(current[attribute[4]]);
							data[2] = parseFloat(current[attribute[5]].split("°")[0]);
							data[3] = parseInt(current[attribute[1]].split("°")[0]);
						}
					}
                    const startTime = utils.getTimestamp(temp[property[3]][events[5]] ? temp[property[3]][events[5]][attribute[0]] : temp[property[3]][events[1]][attribute[0]]);
                    const endTime = utils.getTimestamp(temp[property[3]][events[6]] ? temp[property[3]][events[6]][attribute[0]] : temp[property[3]][events[3]][attribute[0]]);
                    temp[property[5]] = "https://www.heavens-above.com/" + $("#ctl00_cph1_imgViewFinder").attr("src") //.replace("size=800", "size=1600");
                    temp[property[6]] = data;
                    temp[property[7]] = endTime - startTime;
                    temp[property[8]] = 0;
                    const id = utils.md5(Math.random().toString()); //temp[property[1]] + temp[property[7]];
                    temp[property[9]] = id;
                    fs.appendFile(basedir + id + ".html", table.html(), (err) => {
						if (err) console.log(err);
					}); //保存表格
                    request.get(utils.image_options(temp[property[5]])).pipe(fs.createWriteStream(basedir + id + ".png", {
						"flags": "a"
					})).on("error", (err) => {
						console.error(err);
					}); //下载图片
                    resolve(temp);
                });
			});
		}
		Promise.allSettled(queue.map(temp => factory(temp))).then(results => {
			results = results.filter(p => p.status === "fulfilled").map(p => p.value);
			database = database.concat(results);
			$("form").find("input").each((i, o) => {
				if ($(o).attr("name") === "ctl00$cph1$btnPrev" || $(o).attr("name") === "ctl00$cph1$visible") return;
				else next += `&${$(o).attr("name")}=${$(o).attr("value")}`;
			});
			next += "&ctl00$cph1$visible=radioVisible";
			next = next.replace(/\+/g, "%2B").replace(/\//g, "%2F") //.replace(/\$/g, "%24");
			if (counter++ < config.pages) {
				getTable({
					target: config.target,
					pages: config.pages,
					root: config.root,
					counter,
					opt: next,
					database
				});
			} else {
				for (let i = 0; i < 4; i++) {
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
	});
}

exports.getTable = getTable;
