<?
$files = glob('gs://plugins-bucket/plugins/*.{meta}', GLOB_BRACE);
$res = "[";
$i = true;
foreach($files as $file) {
    if ($i === true) {
        $i = false;
    }
    else {
        $res .= ", ";
    }
    $j = json_decode(file_get_contents($file));
    $j->last_modified = file_get_contents(str_replace(".meta", "", $file) . ".js.time", time());
    if (!$j->last_modified)
    {
        $j->last_modified = filemtime($file);
    }
    $j->url = "http://geofs-plugins.appspot.com/load.php?ids=" . $j->id;
    $res .= json_encode($j);
}
$res .= "]";
echo $res;