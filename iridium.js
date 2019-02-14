const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const base = require('./base');

exports.getTable = getTable;

const eventsIridium = ["brightness", "altitude", "azimuth", "satellite", "distanceToFlareCentre", "brightnessAtFlareCentre", "date", "time", "distanceToSatellite", "AngleOffFlareCentre-line", "flareProducingAntenna", "sunAltitude", "angularSeparationFromSun", "image", "id"];

function getTable(config) {
	var database = config.database || [];
	var basedir = config.root + "IridiumFlares/";
	if (config.counter == 0) {
		options = base.get_options("IridiumFlares.aspx?");
		fs.exists(basedir, function(exists) {
			if (!exists) {
				fs.mkdir(basedir, function(err) {
					if (err) console.log(err);
				});
			}
		});
	}
	else {
		options = base.post_options("IridiumFlares.aspx?", config.opt);
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
				for (var i = 0; i < 6; i++) {
					temp[eventsIridium[i]] = $(this).find("td").eq(i + 1).text();
				}
				request(base.iridium_options('https://www.heavens-above.com/' + $(this).find("td").eq(0).find("a").attr("href").replace("type=V", "type=A")), function(error, response, body) {
					//console.log(response.statusCode)
					if (!error && response.statusCode == 200) { //在无SessionID时返回500
						var $ = cheerio.load(body, {
							decodeEntities: false
						});
						var table = $("form").find("table.standardTable"),
							tr = table.find("tbody tr");
						temp[eventsIridium[6]] = tr.eq(0).find("td").eq(1).text();
						temp[eventsIridium[7]] = tr.eq(1).find("td").eq(1).text();
						temp[eventsIridium[8]] = tr.eq(6).find("td").eq(1).text();
						temp[eventsIridium[9]] = tr.eq(7).find("td").eq(1).text();
						temp[eventsIridium[10]] = tr.eq(9).find("td").eq(1).text();
						temp[eventsIridium[11]] = tr.eq(10).find("td").eq(1).text();
						temp[eventsIridium[12]] = tr.eq(11).find("td").eq(1).text();
						temp[eventsIridium[13]] = 'https://www.heavens-above.com/' + $("#ctl00_cph1_imgSkyChart").attr("src")//.replace("size=800", "size=1600");,
						var id = base.md5(Math.random().toString())//temp[eventsIridium[6]];
						temp[eventsIridium[14]] = id;
						fs.appendFile(basedir + id, table.html(), function(err) {
							if (err) console.log(err);
						}); //保存表格
						request.get(base.image_options(temp[eventsIridium[13]])).pipe(fs.createWriteStream(basedir + id + ".png", {"flags": "a"})).on("error", function(err) {
							console.error(err);
						}); //下载图片
						console.log(temp);
						database.push(temp);
					};
				});
			});
			$("form").find("input").each(function() {
				if ($(this).attr("name") == "ctl00$cph1$btnPrev" || $(this).attr("name") == "ctl00$cph1$visible") return;
				else next += `&${$(this).attr("name")}=${$(this).attr("value")}`;
			});
			next += "&ctl00$cph1$visible=radioVisible";
			next = next.replace(/\+/g, "%2B").replace(/\//g, "%2F")//.replace(/\$/g, "%24");
			if (config.counter < config.count) {
				setTimeout(function() {
					getTable({
						count: config.count,
						root: config.root,
						counter: ++config.counter,
						opt: next,
						database: database
					});
				}, 10000);
			}
			else {
				setTimeout(function() {
					fs.appendFile(basedir + "index.json", JSON.stringify(database), function(err) {
						if (err) console.log(err);
					});
				}, 15000);
			}
		}
	});
}
