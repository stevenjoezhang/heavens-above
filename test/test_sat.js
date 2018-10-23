const request = require('request');
const cheerio = require('cheerio');
request(iridium_options(), function(error, response, body) {
	console.log(body)
})

function iridium_options() {
	return {
		url: 'https://www.heavens-above.com/flaredetails.aspx?fid=0&lat=39.9042&lng=116.4074&loc=%e5%8c%97%e4%ba%ac%e5%b8%82&alt=52&tz=ChST',
		method: 'GET',
		headers: {
			"Host": "www.heavens-above.com",
			"Connection": "keep-alive",
			"Cache-Control": "max-age=0",
			"Upgrade-Insecure-Requests": "1",
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
			"DNT": "1",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
			"Accept-Encoding": "deflate, br",
			"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
			"Cookie": "ASP.NET_SessionId=l4orvh0qdi40ho0dsvzzuoc4; preferences=showDaytimeFlares=True; userInfo=lat=39.9042&lng=116.4074&alt=52&tz=ChST&loc=%e5%8c%97%e4%ba%ac%e5%b8%82&cul=en"
		}
	};
}
