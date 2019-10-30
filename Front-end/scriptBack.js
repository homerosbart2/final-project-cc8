var platforms = {};
var modifyId = null;
var search_id_plat = null;
var search_id_hw = null;

let colorCount = 0;
let firstRefresh = true;

const refresh = document.querySelector('#refresh');
const agregarNuevo = document.querySelector('#agregarNuevo');
const platformsContainer = document.querySelector("#platforms-container");
const hardwaresContainer = document.querySelector('#hardwaresContainer');

const colors = [
	"background: linear-gradient(to top right, #ddd6f3, #faaca8);",
	"background: linear-gradient(to top left,  #fc5c7d, #6a82fb);",
	"background: linear-gradient(to top right, #ff5f6d, #ffc371);",
	"background: linear-gradient(to top right,  #00b09b, #96c93d);"
];

refresh.addEventListener('click', () => {
	consultarPlataformas();
});

function platformContainer(nombre, ip, puerto, color, id) {
	return `
		<div class="plt-container">
			<div class="col">
				<div class="card shadow--sm loading" id="platContainer-${id}" style="${color}" onclick="showPagePlt(${id})">
					<div class="loading-spinner-container">
						<i class="fas fa-circle-notch fa-spin"></i>
					</div>
					<div class="card--body">
						<p class="card--text card--size-state">${nombre}</p>
						<p class="card--text">${ip}:${puerto}</p>
					</div>
				</div>
			</div>
			<div class="col">
				<div id="" class="card1 button shadow--md">
					<div class="card--body" onclick="modificar(${id})">
						<p class="card--text card--size-state1 margen">Modificar</p>
					</div>
				</div>
			</div>
		</div>
	`
}

function hardwareContainer(id) {
	let hardware = platforms[id].hardware;

	let hardwares = ``;

	for (let idHW in hardware) {
		let inputBool = hardware[idHW].type == "input";
		let type = (inputBool) ? "Input" : "Output";
		let botonText = (!inputBool) ?
		`<div align="center">
			<span class="switch-container">
				<input type="checkbox" id="switch-${id}-${idHW}">
				<label for="switch-${id}-${idHW}">
					<span class="switch-text"></span>
					<span class="indicator"></span>
				</label>
			</span>
		</div>
		<div class="card--body">
		<input id="text-${id}-${idHW}" class="text-freq" placeholder="Text">`
			:
			`<div class="card--body">`
			;

		hardwares += `
		<div class="hardware-container">
			<div class="flip-card-3D-wrapper">
				<div class="flip-card">
					<div class="flip-card-front">
						<div class="card--body">
							<p class="card--text card--size-state">${hardware[idHW].tag}</p>
							<p class="card--text ">${type}</p>
						</div>
						<button class="flip-turn-back">Modificar</button>
						<button class="btn-consultar" onclick="showModal(${id},'${idHW}')"><i class="fas fa-info-circle"></i></button>
					</div>
					<div class="flip-card-back">
						${botonText}
							<input id="freq-${id}-${idHW}" class="text-freq" placeholder="Frequency">
						</div>
						<div align="center">
							<button class="btn-modify-hardw" onclick="changeHardware(${id},'${idHW}')">✔</button>
						</div>
						<button class="flip-turn-front">Cancelar</button>
					</div>
				</div>
			</div>
		</div>
		`;
	}

	return hardwares;
}

function consultarPlataformas() {
	let http = new XMLHttpRequest();
	let url = 'consulta.php';

	http.onreadystatechange = () => {
		if (http.readyState == XMLHttpRequest.DONE) {
			let respuestaPlataformas = JSON.parse(http.responseText);
			for (let platId in respuestaPlataformas) {
				if (!platforms[platId]) {
					platformsContainer.innerHTML = platformContainer(
						respuestaPlataformas[platId].nombre,
						respuestaPlataformas[platId].ip,
						respuestaPlataformas[platId].puerto,
						colors[colorCount],
						platId
					) + platformsContainer.innerHTML;
					colorCount = (colorCount + 1) % 4;
					platforms[platId] = respuestaPlataformas[platId];
				}
				consultarHardware(platId);
			}
			if(firstRefresh){
				cargarWizard();
				firstRefresh = false;
			}
		}
	}

	http.open("GET", url, true);
	http.send();
}

function consultarHardware(id) {

	let http = new XMLHttpRequest();
	let url = 'infoHW.php';
	let params = "date=" + new Date().toISOString() + "&idPlat="+id;

	http.onreadystatechange = () => {
		if (http.readyState == XMLHttpRequest.DONE) {
			console.log(http.responseText);
			let respuestaHardware = JSON.parse(http.responseText);
			for (let platId in respuestaHardware) {
				platforms[platId]['hardware'] = respuestaHardware[platId]['hardware'];
			}
			document.querySelector(`#platContainer-${id}`).classList.remove('loading');
		}
	}

	http.open("POST", url, true);
	http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	http.send(params);
}

function modificar(id) {
	modifyId = id;
	document.querySelector('#nombrePlataforma').value = platforms[id].nombre;
	document.querySelector('#ipPlataforma').value = platforms[id].ip;
	document.querySelector('#puertoPlataforma').value = platforms[id].puerto;
	addContainer.classList.add('shown');
	isAddContainerShown = true;
	add.querySelector("div p").innerHTML = "Cancelar";
}

function changeHardware(idPlat, idHW){
	let type = platforms[idPlat].hardware[idHW].type;
	let outputBool = type == "output";
	let freq = document.querySelector(`#freq-${idPlat}-${idHW}`);
	let status = null;
	let text = null;
	if(outputBool){
		status = document.querySelector(`#switch-${idPlat}-${idHW}`);
		text = document.querySelector(`#text-${idPlat}-${idHW}`);
	}
	if(freq.value != ""){
		let control = true;
		if(outputBool){
			if(status != null && text != null && text.value != ""){
				control = true;
			} else control = false;
		}
		if(control){
			let http = new XMLHttpRequest();
			let url = 'changeHW.php';
			let fecha = new Date().toISOString();
			let params = `idPlat=${idPlat}&idHW=${idHW}&date=${fecha}&type=${type}&freq=${freq.value}`;
			if(outputBool) params += `&status=${status.checked}&text=${text.value}`;

			console.log(params);
			
			http.onreadystatechange = () => {
				if(http.readyState === XMLHttpRequest.DONE){
					try{
						console.log(http.responseText);
						let respuesta = JSON.parse(http.responseText);
						console.log(respuesta.status);
					}catch (error){
						console.log("error");
					}
				}
			}

			http.open("POST", url, true);
			http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			http.send(params);
		}
	}
	
}

function search(){
	if(search_id_hw != null && search_id_plat != null){
		let fechaFinish = document.querySelector("#fecha-finish").value;
		let fechaStart = document.querySelector("#fecha-start").value;
		let horaFinish = document.querySelector("#hora-finish").value;
		let horaStart = document.querySelector("#hora-start").value;
		if(fechaFinish != "" && fechaStart != "" && horaFinish != "" && horaStart != ""){
			if(horaFinish.length < 6) horaFinish += ":00";
			if(horaStart.length < 6) horaStart += ":00";
			let fecha = new Date().toISOString();
			let startDateTime = fechaStart+"T"+horaStart+".000Z";
			let finishDateTime = fechaFinish+"T"+horaFinish+".000Z";
			
			let http = new XMLHttpRequest();
			let url  = 'searchHW.php';
			let params = `idPlat=${search_id_plat}&idHW=${search_id_hw}&fecha=${fecha}&start=${startDateTime}&finish=${finishDateTime}`;

			http.onreadystatechange = () => {
				if(http.readyState === XMLHttpRequest.DONE) {
					try {
						console.log(http.responseText);
						let respuesta = JSON.parse(http.responseText);
						let data = respuesta.data;
						let fechas = [];
						let sensor = undefined;
						let freq = [];
						let status = undefined;
						if(platforms[search_id_plat].hardware[search_id_hw].type == "input")
							sensor = [];
						else
							status = [];
						let i = 0;
						for(let fecha in data){
							fechas.push(fecha);
							if(sensor)
								sensor.push({
									x:i,
									y:data[fecha].sensor
								});
							if(status)
								status.push({
									x:i,
									y:data[fecha].status
								});
							freq.push({
								x:i,
								y:data[fecha].freq
							});
						}
						createNewChart(fechas, sensor, freq, status);
					} catch (error) {}
				}
			}

			http.open("POST", url, true);
			http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			http.send(params);
		}
	}
}

agregarNuevo.addEventListener('click', () => {
	let nombre = document.querySelector('#nombrePlataforma');
	let ip = document.querySelector('#ipPlataforma');
	let puerto = document.querySelector('#puertoPlataforma');
	if (nombre.value != "" && ip.value != "" && puerto.value != "") {
		let http = new XMLHttpRequest();
		let url = 'agregar.php';
		let params = `nombre=${nombre.value}&ip=${ip.value}&puerto=${puerto.value}`;

		if (modifyId) params += `&id=${modifyId}`;

		http.onreadystatechange = () => {
			if (http.readyState === XMLHttpRequest.DONE) {
				try {
					let respuesta = JSON.parse(http.responseText);
					if (respuesta.success) {
						console.log("Agregado correctamente");
						nombre.value = "";
						ip.value = "";
						puerto.value = "80";
						if (modifyId) {
							modifyId = null;
							colorCount = 0;
							platforms = {};
							platformsContainer.innerHTML = "";
							addContainer.classList.remove('shown');
							isAddContainerShown = false;
							add.querySelector("div p").innerHTML = "Agregar";
						}
						consultarPlataformas();
					} else {
						console.log("Error");
					}
				} catch (error) {
					console.log("Error");
					console.log(http.responseText);
				}
			}
		}

		http.open("POST", url, true);
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		http.send(params);

	}
});

function createEvent(){
	let createPlatId = nuevoEvento.createPlatId;
	let condicionHardware = nuevoEvento.hardwareHardware;
	let thenSelection = nuevoEvento.thenHardware;
	let elseSelection = nuevoEvento.elseHardware;
	let condition = nuevoEvento.condicion;
	if(createPlatId && thenSelection && elseSelection && condicionHardware && condition){
		condicionHardware = condicionHardware.split("-");
		thenSelection = thenSelection.split("-");
		elseSelection = elseSelection.split("-");
		let if_platId = condicionHardware[0];
		let if_hwId = condicionHardware[1];
		let then_platId = thenSelection[0];
		let then_hwId = thenSelection[1];
		let else_platId = elseSelection[0];
		let else_hwId = elseSelection[1];
		let request = {
			idPlat: createPlatId,
			id: platforms[createPlatId].nombre,
			url: platforms[createPlatId].ip,
			puerto: platforms[createPlatId].puerto,
			date: new Date().toISOString(),
			create: {
				if: {
					left:{
						platId: if_platId,
						url: platforms[if_platId].ip,
						id: if_hwId,
						freq: 6000
					},
					condition: condition,
					right: {}
				},
				then: {
					platId: then_platId,
					url: platforms[then_platId].ip,
					id: then_hwId
				},
				else: {
					platId: else_platId,
					url: platforms[else_platId].ip,
					id: else_hwId
				}
			}
		}
		if(nuevoEvento.hardwareSensor) request.create.if.right.sensor = nuevoEvento.hardwareSensor;
		if(nuevoEvento.hardwareFreq) request.create.if.right.freq = nuevoEvento.hardwareFreq;
		if(nuevoEvento.hardwareStatus != undefined && nuevoEvento.hardwareStatus != null)
			request.create.if.right.status = nuevoEvento.hardwareStatus;
		if(nuevoEvento.hardwareText) request.create.if.right.text = nuevoEvento.hardwareText;
		
		if(nuevoEvento.thenFreq) request.create.then.freq = nuevoEvento.thenFreq;
		if(nuevoEvento.thenStatus != undefined && nuevoEvento.thenStatus != null)
			request.create.then.status = nuevoEvento.thenStatus;
		if(nuevoEvento.thenText) request.create.then.text = nuevoEvento.thenText;

		if(nuevoEvento.elseFreq) request.create.else.freq = nuevoEvento.elseFreq;
		if(nuevoEvento.elseStatus != undefined && nuevoEvento.elseStatus != null)
			request.create.else.status = nuevoEvento.elseStatus;
		if(nuevoEvento.elseText) request.create.else.text = nuevoEvento.elseText;

		let http = new XMLHttpRequest();
		let url = 'createEv.php';
		let params = JSON.stringify(request);

		http.onreadystatechange = () => {
			if(http.readyState === XMLHttpRequest.DONE) {
				console.log(http.responseText);
				try{
					let respuesta = JSON.parse(http.responseText);
					if(respuesta.status && respuesta.status == "OK"){
						console.log("Evento creado Exitosamente");
						bodyContainer.classList.add('shown');
						eventos.classList.remove('shown');
						isEventContainerShown = false;
					}else{
						console.log("Ocurrio un error al crear el evento");
					}
				}catch(error){
					console.log("error");
				}
			}
		}

		http.open("POST", url, true);
		http.setRequestHeader('Content-type', 'application/json');
		http.send(params);
	}else{
		console.log("no hay");
	}
}

document.onreadystatechange = () => {
	if (document.readyState == "complete") {
		consultarPlataformas();
		//consultarHardware();
		//loadFlipButton();
		//cargarWizard();
	}
}