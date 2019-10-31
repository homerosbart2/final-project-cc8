<?php

	include 'postgresql.php';

	//$plataformas = getPlataformas($db);


	//$fecha = $_GET['date'];
	$fecha = $_POST['date'];
	$idPlataforma = $_POST['idPlat'];

	$plataforma = getPlataforma($db, $idPlataforma);

	$response = array();

	//foreach ($plataformas as $idPlataforma => $plataforma) {
	if($plataforma){
		$request = array();
		$request['id'] = $plataforma['nombre'];
		$request['url'] = $plataforma['ip'];
		$request['date'] = $fecha;

		$url = "http://{$plataforma['ip']}/info/";
		$data = json_encode($request);
		
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_PORT, $plataforma['puerto']);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, TRUE);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));

		$platformResponse = curl_exec($curl);

		curl_close($curl);

		if($platformResponse){
			$platformResponse = json_decode($platformResponse, true);
			$hardware = $platformResponse['hardware'];
			foreach ($hardware as $idHW => $hw){
				$ret = insertHW(
					$db,
					$idHW,
					$hw['tag'],
					$hw['type'],
					$idPlataforma
				);
			}
		}else{
			$hardware = getHW($db, $idPlataforma);
			$platformResponse = array(
				'hardware' => $hardware
			);
		}
		$response["{$idPlataforma}"] = $platformResponse;
	}
	//}

	echo json_encode($response);

	closeDB($db);

?>