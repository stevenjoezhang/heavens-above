const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const base = require('./base.js');

exports.getTable = getTable;

const property = ["url", "date", "brightness", "events", "passType", "image", "scoreData", "exist", "score"];
const events = ["rise", "reachAltitude10deg", "highestPoint", "dropBelowAltitude10deg", "set", "exitShadow", "enterShadow"];
const attribute = ["time", "altitude", "azimuth", "distance", "brightness", "sunAltitude"];

const count = 4;

var compare = [
	function (a, b) {
		return a[property[6]][1] >= b[property[6]][1] ? 1 : -1; //星等（越小越好）
	}, function (a, b) {
		return a[property[6]][2] >= b[property[6]][2] ? 1 : -1; //太阳高度（越小越好）
	}, function (a, b) {
		return a[property[6]][3] <= b[property[6]][3] ? 1 : -1; //卫星高度（越大越好）
	}, function (a, b) {
		return a[property[7]] <= b[property[7]] ? 1 : -1; //持续时间（越大越好）
	}];
var weight = [9.5, 6, 6.5, 6.5, 7.5];

function getTable(database, target, counter, opt) {
	if (counter == 0) {
		options = base.get_options("PassSummary.aspx?satid=" + target + "&");
	}
	else {
		options = base.post_options("PassSummary.aspx?satid=" + target + "&", opt);
	}
	request(options, function(error, response, body) { //请求成功的处理逻辑
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(body, {
				decodeEntities: false
			});
			var next = "__EVENTTARGET=&__EVENTARGUMENT=&__LASTFOCUS=";
			var tbody = $("form").find("table.standardTable tbody");
			tbody.find("tr").each(function() {
				var temp = {};
				temp[property[0]] = 'https://www.heavens-above.com/' + $(this).find("td").eq(0).find("a").attr("href").replace("type=V", "type=A");
				temp[property[1]] = $(this).find("td").eq(0).find("a").text();
				temp[property[2]] = $(this).find("td").eq(1).text();
				temp[property[3]] = {};
				temp[property[4]] = $(this).find("td").eq(11).text();
				request(temp[property[0]], function(error, response, body) {
					if (!error && response.statusCode == 200) {
						var $ = cheerio.load(body, {
							decodeEntities: false
						}),
							tbody = $("form").find("table.standardTable tbody"),
							shift = 0,
							score = 0,
							flag = false; //防止i - shift == 2触发两次的问题
						for (var i = 0; i < tbody.find("tr").length; i++) {
							if (tbody.find("tr").eq(i).find("td").eq(0).text() == "Exits shadow") {
								temp[property[3]][events[5]] = {};
								current = temp[property[3]][events[5]];
								shift++;
							}
							else if (tbody.find("tr").eq(i).find("td").eq(0).text() == "Enters shadow") {
								temp[property[3]][events[6]] = {};
								current = temp[property[3]][events[6]];
								shift++;
							}
							else {
								temp[property[3]][events[i - shift]] = {};
								current = temp[property[3]][events[i - shift]];
							}
							for (var j = 0; j < 6; j++) {
								current[attribute[j]] = tbody.find("tr").eq(i).find("td").eq(j + 1).text();
							}
							if (i - shift == 2 && !flag) { //防止因为网站上表格顺序打乱而获得错误的数据
								flag = true;
								var hours = parseInt(current[attribute[0]].split(":")[0]),
									mag = parseFloat(current[attribute[4]]),
									sunalt = parseFloat(current[attribute[5]].split("°")[0]),
									alt = parseInt(current[attribute[1]].split("°")[0]);
							}
						}
						var startTime = base.getTimestamp(temp[property[3]][events[5]] ? temp[property[3]][events[5]][attribute[0]] : temp[property[3]][events[1]][attribute[0]]);
						var endTime = base.getTimestamp(temp[property[3]][events[6]] ? temp[property[3]][events[6]][attribute[0]] : temp[property[3]][events[3]][attribute[0]]);
						//console.log(startTime, endTime);
						//if (hours >= 17 && hours <= 23) score += 100;
						//if (target == 25544 && mag <= -2) score -= (mag + 2) * 60;
						//else if (target == 41765 && mag <= 2) score -= (mag - 2) * 60;
						//score += alt / 0.9;
						//score += (endTime - startTime - 120) / 480 * 100;
						//console.log(">>>", hours >= 17 && hours <= 23 ? 100 : 0, alt / 0.9, -(mag + 2) * 60, (endTime - startTime - 120) / 480 * 100, score / 4);
						temp[property[5]] = 'https://www.heavens-above.com/' + $("#ctl00_cph1_imgViewFinder").attr("src").replace("size=800", "size=1600");
						temp[property[6]] = [hours, mag, sunalt, alt];
						temp[property[7]] = endTime - startTime;
						temp[property[8]] = 0; //Math.round(score / 4)
						console.log(temp);
						database.push(temp);
					};
				});
			});
			$("form").find("input").each(function() {
				if ($(this).attr("name") == "ctl00$cph1$btnPrev" || $(this).attr("name") == "ctl00$cph1$visible") return;
				else next += "&" + $(this).attr("name") + "=" + $(this).attr("value");
			});
			next += "&ctl00$cph1$visible=radioVisible";
			next = next.replace(/\+/g, "%2B").replace(/\//g, "%2F")//.replace(/\$/g, "%24");
			if (counter++ <= count) getTable(database, target, counter, next);
			else {
				for (var i = 0; i < 4; i++) {
					database.sort(compare[i]);
					database = database.map(function(ele, index) {
						ele[property[8]] += 100 * (1 - index / database.length) * weight[i];
						return ele;
					});
				}
				database = database.map(function(ele, index) {
					if (isNaN(ele[property[6]][1])) {
						ele[property[8]] = 0;
						return ele;
					} //上中天没有星等直接归零
					if (ele[property[6]][0] >= 17 && ele[property[6]][0] <= 19) {
						ele[property[8]] += 85 * weight[4];
					}
					else if (ele[property[6]][0] >= 20 && ele[property[6]][0] <= 23) {
						ele[property[8]] += 95 * weight[4];
					}
					else if (ele[property[6]][0] >= 0 && ele[property[6]][0] <= 3) {
						ele[property[8]] += 40 * weight[4];
					}
					else if (ele[property[6]][0] >= 4 && ele[property[6]][0] <= 6) {
						ele[property[8]] += 30 * weight[4];
					}
					ele[property[8]] = Math.floor(ele[property[8]] / 40);
					return ele;
				});
				database.sort(function(a, b) {
					return a[property[8]] <= b[property[8]] ? 1 : -1; //分数
				});
				fs.appendFile("satellite" + target + ".json", JSON.stringify(database), function(err) {
					if (err) console.log(err);
				});
			}
		}
	});
}
