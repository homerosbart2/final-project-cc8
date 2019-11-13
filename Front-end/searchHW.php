<?php

    include 'postgresql.php';

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
            $respuesta = json_decode($platformResponse, true);
            
            $data = $respuesta['data'];
            foreach ($data as $fechaReg => $registro) {
                $valor_sensor = 0;
                $valor_freq = 0;
                $valor_status = "FALSE";
                $valor_text = "NULL";
                if(array_key_exists('sensor', $registro)) $valor_sensor = $registro['sensor'];
                if(array_key_exists('status', $registro))
                    if($registro['status']) $valor_status = "TRUE";
                    else $valor_status = "FALSE";
                if(array_key_exists('freq', $registro)) $valor_freq = $registro['freq'];
                if(array_key_exists('text', $registro)) $valor_text = $registro['text'];

                if($valor_text == "") $valor_text = "NULL";
                else $valor_text = '\'' . $valor_text . '\'';

                insertSearchRow($db, $idPlat, $idHW, $fechaReg, $valor_sensor, $valor_status, $valor_freq, $valor_text);
            }
        } else {
            $registros = getRegistros($db, $idPlat, $idHW, $start, $finish);
            echo json_encode($registros);
        }
    } else {
        echo 'Error';
    }

    closeDB($db);

?>