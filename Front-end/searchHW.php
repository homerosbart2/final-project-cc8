<?php

    include 'sqlite.php';

    $idPlat = $_POST['idPlat'];
    $idHW = $_POST['idHW'];
    $fecha = $_POST['fecha'];
    $start = $_POST['start'];
    $finish = $_POST['finish'];

    $result = getPlataforma($db, $idPlat);

    if($result) {
        $request = array(
            'id' => $result['nombre'],
            'url' => $result['ip'],
            'date' => $fecha,
            'search' => array(
                'id_hardware' => $idHW,
                'start_date' => $start,
                'finish_date' => $finish
            )
        );

        $request = json_encode($request);

        $url = "http://{$result['ip']}/search/";
        
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_PORT, $result['puerto']);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POST, TRUE);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $request);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));

        $platformResponse = curl_exec($curl);
        curl_close($curl);
        if($platformResponse){
            echo $platformResponse;
        } else {
            echo 'error';
        }
    } else {
        echo 'Error';
    }

    $db->close();

?>