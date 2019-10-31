<?php
include 'postgresql.php';

$nombre = $_POST['nombre'];
$ip = $_POST['ip'];
$puerto = $_POST['puerto'];
$id = null;
$update = false;

$ret = false;

if (isset($_POST['id'])) {
    $update = true;
    $id = $_POST['id'];
    $ret = updatePlataforma($db, $id, $nombre, $ip, $puerto);
}else{
    $ret = insertPlataforma($db, $nombre, $ip, $puerto);
}

$respuesta = array(
    'success' => false,
    'update' => false,
    'insert' => false
);

if($ret){
    $respuesta['success'] = true;
    if($update){
        $respuesta['update'] = true;
    }else{
        $respuesta['insert'] = true;
    }
}

echo json_encode($respuesta);

closeDB($db);
?>
