<?php
	@$target = $_GET['target'];
	@$id = $_GET['id'];
	if (!$target || !$id) die();
	$img = $target.'/'.$id.'.png';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>卫星过境信息</title>
<link rel="stylesheet" href="css/ha.css"/>
</head>
<body>
<h1>点击图片即可下载</h1>
<a href="<?php echo $img ?>" download="<?php echo $id ?>">
	<img src="<?php echo $img ?>" alt="">
</a>
<table class="standardTable">
<?php
echo file_get_contents($target.'/'.$id);
?>
</table>
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.0.0-alpha.12/dist/html2canvas.min.js"></script>
<script>
var table = document.getElementsByClassName("standardTable")[0];
html2canvas(table).then(function(canvas) {
	document.body.appendChild(canvas);
	var img = new Image(),
		url = canvas.toDataURL("image/png");
	img.src = url;
	img.onload = function() {
		var anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "<?php echo $id.'_data' ?>";
		document.body.appendChild(anchor);
		anchor.appendChild(img);
		document.body.removeChild(canvas);
		document.body.removeChild(table);
	}
});
</script>
</body>
</html>
