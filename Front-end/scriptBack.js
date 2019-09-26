let platforms = {};
let colorCount = 0;

var modifyId = null;

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
		<div class="plt-container" onclick="showPagePlt(${id})">
			<div class="col">
				<div class="card shadow--sm" style="${color}">
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
		let inputBool = hardware[idHW].type == "i";
		let type = (inputBool) ? "input" : "output";
		let botonText = (!inputBool) ?
		`<div align="center">
			<span class="switch-container">
				<input type="checkbox" id="switch-${idHW}">
				<label for="switch-${idHW}">
					<span class="switch-text"></span>
					<span class="indicator"></span>
				</label>
			</span>
		</div>
		<div class="card--body">
		<input type="" name="" class="text-freq" placeholder="Text">`
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
						<button class="btn-consultar"><i class="fas fa-info-circle"></i> </button>
					</div>
					<div class="flip-card-back">
						${botonText}
							<input type="" name="" class="text-freq" placeholder="Frequency">
						</div>
						<div align="center">
							<button class="btn-modify-hardw">✔</button>
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
			let respuestaHardware = JSON.parse(http.responseText);
			for (let platId in respuestaHardware) {
				platforms[platId]['hardware'] = respuestaHardware[platId]['hardware'];
			}
			loadFlipButton();
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

document.onreadystatechange = () => {
	if (document.readyState == "complete") {
		consultarPlataformas();
		//consultarHardware();
		//loadFlipButton();
	}
}