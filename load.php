<?
header("Access-Control-Allow-Origin: *");
header("Content-Type: plain/text");
$ext = explode(",", $_GET["ids"]);
$res = "";
foreach ($ext as $e) {
    $res .= "\n\n" . file_get_contents("gs://plugins-bucket/plugins/" . $e . ".js");
}
echo $res;