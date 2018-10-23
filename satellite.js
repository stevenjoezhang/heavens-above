const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const base = require('./base.js');

exports.getTable = getTable;

const property = ["url", "date", "brightness", "events", "passType", "image", "score", "exist"];
const events = ["rise", "reachAltitude10deg", "highestPoint", "dropBelowAltitude10deg", "set", "exitShadow", "enterShadow"];
const attribute = ["time", "altitude", "azimuth", "distance", "brightness", "sunAltitude"];

const count = 4;
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
						});
						var tbody = $("form").find("table.standardTable tbody");
						var shift = 0;
						var score = 0;
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
							if (i - shift == 2) {
								var hours = parseInt(current[attribute[0]].split(":")[0]);
								var mag = parseFloat(current[attribute[4]]);
								var alt = parseInt(current[attribute[1]].split("°")[0]);
							}
						}
						var startTime = base.getTimestamp(temp[property[3]][events[5]] ? temp[property[3]][events[5]][attribute[0]] : temp[property[3]][events[1]][attribute[0]]);
						var endTime = base.getTimestamp(temp[property[3]][events[6]] ? temp[property[3]][events[6]][attribute[0]] : temp[property[3]][events[3]][attribute[0]]);
						//console.log(startTime, endTime);
						if (hours >= 17 && hours <= 23) score += 100;
						if (target == 0 && mag <= -2) score -= (mag + 2) * 60;
						else if (target == 1 && mag <= 2) score -= (mag - 2) * 60;
						score += alt / 0.9;
						score += (endTime - startTime - 120) / 480 * 100;
						console.log(">>>", hours >= 17 && hours <= 23 ? 100 : 0, alt / 0.9, -(mag + 2) * 60, (endTime - startTime - 120) / 480 * 100, score/4)
						temp[property[5]] = 'https://www.heavens-above.com/' + $("#ctl00_cph1_imgViewFinder").attr("src").replace("size=800", "size=1600");
						temp[property[6]] = Math.round(score / 4);
						temp[property[7]] = endTime - startTime;
						//console.log(temp);
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
				fs.appendFile("satellite" + target + ".json", JSON.stringify(database), function(err) {
					if (err) console.log(err);
				});
			}
		}
	});
}
