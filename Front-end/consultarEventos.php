<?php

    include 'postgresql.php';

    echo json_encode(getEvento($db));

    closeDB($db);

?>