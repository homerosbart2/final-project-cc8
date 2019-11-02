<?php

include 'postgresql.php';

$idPlat = $_POST['idPlat'];
$idEv = $_POST['idEv'];
$fecha = $_POST['fecha'];

$plataforma = getPlataforma($db, $idPlat);

if($plataforma){
    $request = array(
        'id' => $plataforma['nombre'],
        'url' => $plataforma['ip'],
        'date' => $fecha,
        'delete' => array(
            'id' => $idEv
        )
    );

    $url = "http://{$plataforma['ip']}/delete/";
    $data = json_encode($request);

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_PORT, $plataforma['puerto']);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, TRUE);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));

    $platformResponse = curl_exec($curl);

    curl_close($curl);
    if($platformResponse){
        echo $platformResponse;
        $resultado = json_decode($platformResponse, true);
        if(array_key_exists('status', $resultado) && $resultado['status'] == "OK"){
            deleteEvento();
        }
    }
}

closeDB($db);
?>