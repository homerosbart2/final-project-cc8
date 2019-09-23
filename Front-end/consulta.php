<?php
include 'sqlite.php';

$plataformas = getPlataformas($db);

echo json_encode($plataformas);

$db->close();
?>