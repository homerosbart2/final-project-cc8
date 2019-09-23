<?php
include 'sqlite.php';

$nombre = $_POST['nombre'];
$ip = $_POST['ip'];
$puerto = $_POST['puerto'];
$id = null;
$update = false;

$sql = "INSERT INTO plataformas(nombre, ip, puerto) VALUES ('{$nombre}', '{$ip}', {$puerto})";

if (isset($_POST['id'])) {
    $update = true;
    $id = $_POST['id'];
    $sql = "UPDATE plataformas SET nombre = '{$nombre}', ip = '{$ip}', puerto = {$puerto} WHERE id = {$id}";
}

$ret = $db->exec($sql);

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

$db->close();
?>
