<?php

include 'postgresql.php';

$idPlat = $_POST['idPlat'];
$idHW = $_POST['idHW'];
$fecha = $_POST['date'];
$type = $_POST['type'];
$status = null;
$freq = $_POST['freq'];
$text = null;
$inputBool = ($type === "input") ? true : false;
if(!$inputBool){
    $status = $_POST['status'] == "true";
    $text = $_POST['text'];
}

$result = getPlataforma($db, $idPlat);

if ($result) {
    $resquest = array(
        'id' => $result['nombre'],
        'url' => $result['ip'],
        'date' => $fecha,
        'change' => array(
            $idHW => array(
                'freq' => (int)$freq,
            )
        )
    );
    if(!$inputBool){
        $resquest['change'][$idHW]['status'] = $status;
        $resquest['change'][$idHW]['text'] = $text;
    }

    $url = "http://{$result['ip']}/change/";
    $data = json_encode($resquest);

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_PORT, $result['puerto']);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, TRUE);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));

    $platformResponse = curl_exec($curl);
    curl_close($curl);
    $response = $platformResponse;
    if($platformResponse){
        echo $platformResponse;
    }else{
        $response = array(
            'status' => 'ERROR'
        );
        echo json_encode($response);
    }
} else {
    $response = array(
        'status' => 'ERROR'
    );
    echo json_encode($response);
}

closeDB($db);

?>