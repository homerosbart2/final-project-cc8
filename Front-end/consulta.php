<?php
include 'postgresql.php';

$plataformas = getPlataformas($db);

echo json_encode($plataformas);

closeDB($db);
?>