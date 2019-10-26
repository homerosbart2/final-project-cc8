<?php

include 'sqlite.php';

$json_evento = json_decode(file_get_contents('php://input'), true);

$idPlat = $json_evento['idPlat'];
unset($json_evento['idPlat']);

$plataforma = getPlataforma($db, $idPlat);

$response = array();
if($plataforma){
    $url = "http://{$plataforma['ip']}/create/";
    $data = json_encode($json_evento);

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_PORT, $plataforma['puerto']);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, TRUE);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));

    $platformRresponse = crul_exec($curl);
    curl_close($curl);
    if($platformRresponse){
        echo $platformRresponse;
        $resultado = json_decode($platformRresponse, true);
        if($resultado['status'] == "OK"){
            //Guardar evento en la BD
        }
    }
}

$db->close();
?>