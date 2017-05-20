<?
$status = "";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($_POST["fcontent"] == "") {
        unlink("gs://plugins-bucket/plugins/" . $_POST["file"]);
        exit;
    }

    try {
        file_put_contents("gs://plugins-bucket/plugins/" . $_POST["file"], trim($_POST["fcontent"]));
        $status = "saved on " . time();
    }
    catch (Exception $e) {
        $status = "error on " . time();
    }

    $filecontent = file_get_contents("gs://plugins-bucket/plugins/" . $_POST["file"]);
    $filename = $_POST["file"];
}
else {
    $filecontent = file_get_contents("gs://plugins-bucket/plugins/" . $_GET["file"]);
    $filename = $_GET["file"];
}
?>

<html>
<head>
    <title>Edit <? echo $filename; ?></title>
</head>
<body>
    <form id="subform" action="edit.php" method="post">
    <input id="file" name="file" type="text" hidden value="<?php echo $filename; ?>" />
    <textarea id="fcontent" name="fcontent" style="position: fixed; width: 100%; height: 90%"><? echo $filecontent; ?></textarea>
    <input type="submit" style="position: fixed; bottom: 0;"/><?php echo $status ?>
    </form>
</body>
</html>