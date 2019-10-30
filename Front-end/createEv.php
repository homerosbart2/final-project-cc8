<?php

    include 'sqlite.php';

    $json_evento = json_decode(file_get_contents('php://input'), true);

    $puerto = $json_evento['puerto'];
    $ip = $json_evento['url'];
    $idPlataformas = array(
        'platId' => $json_evento['idPlat'],
        'if_platId' => $json_evento['create']['if']['left']['platId'],
        'then_platId' => $json_evento['create']['then']['platId'],
        'else_platId' => $json_evento['create']['else']['platId']
    );
    unset($json_evento['puerto']);
    unset($json_evento['idPlat']);
    unset($json_evento['create']['if']['left']['platId']);
    unset($json_evento['create']['then']['platId']);
    unset($json_evento['create']['else']['platId']);

    $response = array();

    $url = "http://{$ip}/create/";
    $data = json_encode($json_evento);

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_PORT, $puerto);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, TRUE);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));

    $platformRresponse = curl_exec($curl);
    curl_close($curl);
    if($platformRresponse){
        echo $platformRresponse;
        $resultado = json_decode($platformRresponse, true);
        if($resultado['status'] == "OK"){
            insertEvento($db, $resultado['idEvent'], $idPlataformas, $json_evento);
        }
    }else{
        $response['status'] = 'ERROR';
        echo json_encode($response);
    }


    $db->close();
?>