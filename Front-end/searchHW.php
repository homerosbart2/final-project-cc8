<?php

    include 'sqlite.php';

    $sql = "SELECT * from plataformas WHERE id = 1"

    $ret = $db->exec($sql);
    $row = $ret->fetchArray(SQLITE3_ASSOC);

    $request = array(
        'id' => $row['nombre'],
        'url' => $row['ip'],
        'date' => "1989-12-20T07:35:58.757Z",
        'search' => array(
            'id_hardware' => 'id03',
            'start_date' => '2019-09-20T14:40:08.268Z',
            'finish_date' => '2019-09-22T18:08:49.119Z'
        )
    );

    $request = json_encode($request);

    $url = "http://{$row['ip']}/search/";
    
    $curl = curl_init($url);
    curl_setopt($curl,)

?>