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

?>