<?php

class DB extends SQLite3 {
    function __construct() {
        $this->open('frontEnd.db');
    }
}

$db = new DB();

function getPlataformas($db){

    $sql = "SELECT * FROM plataformas;";

    $ret = $db->query($sql);
    $plataformas = array();

    while($row = $ret->fetchArray(SQLITE3_ASSOC)){
        $plataformas[$row['id']] = array('ip' => $row['ip'], 'puerto' => $row['puerto'], 'nombre' => $row['nombre']);
    }

    return $plataformas;
}

function getPlataforma($db, $id){

    $sql = "SELECT * FROM plataformas WHERE id = '{$id}'";

    $ret = $db->query($sql);
    $result = null;

    while($row = $ret->fetchArray(SQLITE3_ASSOC)){
        $result = array(
            'ip' => $row['ip'],
            'nombre' => $row['nombre'],
            'puerto' => $row['puerto']
        );
    }

    return $result;

}

function insertHW($db, $idHW, $tag, $type, $idPlataforma){
    
    $type = ($type == "input") ? "i" : "o" ;
    $sql = "INSERT OR REPLACE INTO hardware (id, tag, type, plataforma) VALUES ('{$idHW}', '{$tag}', '$type', $idPlataforma)";

    $ret = $db->exec($sql);

    return $ret;

}

function insertSearchRow($db, $idPlat, $idHW, $fecha, $sensor, $status, $freq, $text){
    $sql = "INSERT OR REPLACE INTO searchdata (idhardware, idplataforma, fecha, sensor, status, frequency, text) VALUES ('{$idHW}',{$idPlat},'{$fecha}',{$sensor},{$status},{$freq},'{$text}');";

    $ret = $db->exec($sql);

    return $ret;
}
//$id, $idPlat, $fecha, $if_left_url, $if_left_id, $if_left_freq, $if_condicion, $if_right_sensor, $if_right_status, $if_right_freq, $if_right_text, $then_url, $then_id
function insertEvento($db, $id, $idPlataformas, $json_evento){
    $fecha = $json_evento['date'];

    $platId = $idPlataformas['platId'];

    $if_object = $json_evento['create']['if'];
    $then_object = $json_evento['create']['then'];
    $else_object = $json_evento['create']['else'];

    //$if_left_url = $if_object['left']['url'];
    $if_platId = $idPlataformas['if_platId'];
    $if_left_id = $if_object['left']['id'];
    $if_left_freq = $if_object['left']['freq'];

    $if_condicion = $if_object['condition'];

    $if_right = $if_object['right'];

    $if_right_sensor = 'NULL';
    if(array_key_exists('sensor', $if_right))
        $if_right_sensor = $if_right['sensor'];
    
    $if_right_status = 'NULL';
    if(array_key_exists('status', $if_right))
        $if_right_status = ($if_right['status']) ? 1 : 0;

    $if_right_freq = 'NULL';
    if(array_key_exists('freq', $if_right))
        $if_right_freq = $if_right['freq'];

    $if_right_text = 'NULL';
    if(array_key_exists('text', $if_right))
        $if_right_text = '\'' . $if_right['text'] . '\'';
    
    //$then_url = $then_object['url'];
    $then_platId = $idPlataformas['then_platId'];
    $then_id = $then_object['id'];
    
    $then_status = 'NULL';
    if(array_key_exists('status', $then_object))
        $then_status = ($then_object['status']) ? 1 : 0;

    $then_freq = 'NULL';
    if(array_key_exists('freq', $then_object))
        $then_freq = $then_object['freq'];

    $then_text = 'NULL';
    if(array_key_exists('text', $then_object))
        $then_text = '\'' . $then_object['text'] . '\'';

    //$else_url = $else_object['url'];
    $else_platId = $idPlataformas['else_platId'];
    $else_id = $else_object['id'];

    $else_status = 'NULL';
    if(array_key_exists('status', $else_object))
        $else_status = ($else_object['status']) ? 1 : 0;

    $else_freq = 'NULL';
    if(array_key_exists('freq', $else_object))
        $else_freq = $else_object['freq'];

    $else_text = 'NULL';
    if(array_key_exists('text', $else_object))
        $else_text = '\'' . $else_object['text'] . '\'';

    $sql = "INSERT INTO eventos VALUES(
        '{$id}',
        {$platId},
        '{$fecha}',
        {$if_platId},
        '{$if_left_id}',
        {$if_left_freq},
        '{$if_condicion}',
        {$if_right_sensor},
        {$if_right_status},
        {$if_right_freq},
        {$if_right_text},
        {$then_platId},
        '{$then_id}',
        {$then_status},
        {$then_freq},
        {$then_text},
        {$else_platId},
        '{$else_id}',
        {$else_status},
        {$else_freq},
        {$else_text}
    );";

    $db->exec($sql);
 }

function getRegistros($db, $idPlat, $idHW, $start, $finish){
    $sql = "SELECT * FROM searchdata WHERE fecha >= '$start' AND fecha <= '$finish'";

    $ret = $db->query($sql);
    $registros = array(
        'search' => array(
            'id_hardware' => $idHW,
        ),
        'data' => array()
    );

    while ($row = $ret->fetchArray(SQLITE3_ASSOC)) {
        $registros['data'][$row['fecha']] = array(
            'sensor' => $row['sensor'],
            'status' => $row['status'],
            'freq' => $row['frequency'],
            'text' => $row['text']
        );
    }

    return $registros;
}

function getHW($db, $idPlataforma){

    $sql = "SELECT * FROM hardware WHERE plataforma = {$idPlataforma}";

    $ret = $db->query($sql);

    $hardware = array();
    while ($row = $ret->fetchArray(SQLITE3_ASSOC)) {
        $type = ($row['type'] == "i") ? "input" : "output";
        $hardware[$row['id']] = array(
            'tag' => $row['tag'],
            'type' => $type
        );
    }

    return $hardware;
}

function getEvento($db){
    $sql = "SELECT * FROM eventos";
    
    $ret = $db->query($sql);

    $eventos = array();
    while($row = $ret->fetchArray(SQLITE3_ASSOC)) {
        $eventos[$row['id']] = array(
            'idPlataforma' => $row['idplataforma'],
            'fecha' => $row['fecha'],
            'if_platId' => $row['if_platId'],
            'if_left_id' => $row['if_left_id'],
            'if_left_freq' => $row['if_left_freq'],
            'if_condicion' => $row['if_condicion'],
            'if_right_sensor' => $row['if_right_sensor'],
            'if_right_status' => $row['if_right_status'],
            'if_right_freq' => $row['if_right_freq'],
            'if_right_text' => $row['if_right_text'],
            'then_platId' => $row['then_platId'],
            'then_id' => $row['then_id'],
            'then_status' => $row['then_status'],
            'then_freq' => $row['then_freq'],
            'then_text' => $row['then_text'],
            'else_platId' => $row['else_platId'],
            'else_id' => $row['else_id'],
            'else_status' => $row['else_status'],
            'else_freq' => $row['else_freq'],
            'else_text' => $row['else_text']
        );
    }
    return $eventos;
}

?>