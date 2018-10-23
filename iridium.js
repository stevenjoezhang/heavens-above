const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const base = require('./base.js');

exports.getTable = getTable;

const eventsIridium = ["url", "brightness", "altitude", "azimuth", "satellite", "distanceToFlareCentre", "brightnessAtFlareCentre", "date", "time", "distanceToSatellite", "AngleOffFlareCentre-line", "flareProducingAntenna", "sunAltitude", "angularSeparationFromSun", "image"];

const count = 4;
function getTable(database, target, counter, opt) {
	if (counter == 0) {
		options = base.get_options("IridiumFlares.aspx?" + target);
	}
	else {
		options = base.post_options("IridiumFlares.aspx?" + target, opt);
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
				temp[eventsIridium[0]] = 'https://www.heavens-above.com/' + $(this).find("td").eq(0).find("a").attr("href").replace("type=V", "type=A");
				for (var i = 1; i <= 6; i++) {
					temp[eventsIridium[i]] = $(this).find("td").eq(i).text();
				}
				request(base.iridium_options(temp[eventsIridium[0]]), function(error, response, body) {
					console.log(response.statusCode)
					if (!error && response.statusCode == 200) { //在无SessionID时返回500
						var $ = cheerio.load(body, {
							decodeEntities: false
						});
						var tbody = $("form").find("table.standardTable tbody");
						temp[eventsIridium[7]] = tbody.find("tr").eq(0).find("td").eq(1).text();
						temp[eventsIridium[8]] = tbody.find("tr").eq(1).find("td").eq(1).text();
						temp[eventsIridium[9]] = tbody.find("tr").eq(6).find("td").eq(1).text();
						temp[eventsIridium[10]] = tbody.find("tr").eq(7).find("td").eq(1).text();
						temp[eventsIridium[11]] = tbody.find("tr").eq(9).find("td").eq(1).text();
						temp[eventsIridium[12]] = tbody.find("tr").eq(10).find("td").eq(1).text();
						temp[eventsIridium[13]] = tbody.find("tr").eq(11).find("td").eq(1).text();
						temp[eventsIridium[14]] = 'https://www.heavens-above.com/' + $("#ctl00_cph1_imgSkyChart").attr("src").replace("size=800", "size=1600");
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
			if (counter++ <= count) {
				setTimeout(function() {
					getTable(database, target, counter, next);
				}, 5000);
			}
			else {
				fs.appendFile("satellite" + target + ".json", JSON.stringify(database), function(err) {
					if (err) console.log(err);
				});
			}
		}
	});
}
