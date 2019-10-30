<?php

    include 'sqlite.php';

    echo json_encode(getEvento($db));

    $db->close();

?>