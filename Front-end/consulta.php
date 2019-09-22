<?php
class DB extends SQLite3 {
  function __construct() {
      $this->open('frontEnd.db');
  }
}

$db = new DB();

$sql = "SELECT * FROM plataformas;";

$ret = $db->query($sql);
$plataformas = array();

while($row = $ret->fetchArray(SQLITE3_ASSOC)){
  $plataformas[$row['id']] = array('ip' => $row['ip'], 'puerto' => $row['puerto'], 'nombre' => $row['nombre']);
}

echo json_encode($plataformas);

$db->close();
?>