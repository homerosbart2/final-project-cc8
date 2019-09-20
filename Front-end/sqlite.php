<?php

class DB extends SQLite3 {
    function __construct() {
        $this->open('frontEnd.db');
    }
}

$db = new DB();
if(!$db)
{
    echo $db->lastErrorMsg();
} else {
    echo "Open database successfully \r\n";
}

$sql = "SELECT * FROM plataformas;";

$ret = $db->query($sql);
while($row = $ret->fetchArray(SQLITE3_ASSOC)){
    echo "id : " . $row['id'] . "\r\n";
    echo "nombre : " . $row['nombre'] . "\r\n";
    echo "ip : " . $row['ip'] . "\n";
    echo "puerto : " . $row['puerto'] . "\r\n";
}

$db->close();
?>