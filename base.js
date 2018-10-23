exports.getTimestamp = getTimestamp;
exports.post_options = post_options;
exports.get_options = get_options;
exports.iridium_options = iridium_options;

var config = [39.9042, 116.4074, "%E5%8C%97%E4%BA%AC%E5%B8%82", 52, "ChST"];

function getTimestamp(time) {
	var arr = time.split(":");
	return parseInt(arr[0]) * 3600 + parseInt(arr[1]) * 60 + parseInt(arr[2]);
}
function post_options(target, opt) {
	return {
		url: 'https://www.heavens-above.com/' + target + 'lat=39.9042&lng=116.4074&loc=%E5%8C%97%E4%BA%AC%E5%B8%82&alt=52&tz=ChST',
		method: 'POST',
		json: true,
		body: opt,
		headers: {
			"Host": "www.heavens-above.com",
			"Connection": "keep-alive",
			"Cache-Control": "max-age=0",
			"Origin": "https://www.heavens-above.com",
			"Upgrade-Insecure-Requests": "1",
			"DNT": "1",
			"Content-Type": "application/x-www-form-urlencoded",
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
			"Accept-Encoding": "deflate, br",
			"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
			"Cookie": "ASP.NET_SessionId=l4orvh0qdi40ho0dsvzzuoc4; preferences=showDaytimeFlares=True; userInfo=lat=39.9042&lng=116.4074&alt=52&tz=ChST&loc=%e5%8c%97%e4%ba%ac%e5%b8%82&cul=en"
		}
	};
}
function get_options(target) {
	return {
		url: 'https://www.heavens-above.com/' + target + 'lat=39.9042&lng=116.4074&loc=%E5%8C%97%E4%BA%AC%E5%B8%82&alt=52&tz=ChST',
		method: 'GET',
		headers: {
			"Host": "www.heavens-above.com",
			"Connection": "keep-alive",
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
function iridium_options(target) {
	return {
		url: target,
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
