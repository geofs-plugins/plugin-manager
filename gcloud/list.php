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
    $res .= file_get_contents($file);
}
$res .= "]";
echo $res;