let platforms = {};
let colorCount = 0;

var modifyId = null;

const refresh = document.querySelector('#refresh');
const agregarNuevo = document.querySelector('#agregarNuevo');
const platformsContainer = document.querySelector("#platforms-container");

const colors = [
	"background: linear-gradient(to top right, #ddd6f3, #faaca8);",
	"background: linear-gradient(to top left,  #fc5c7d, #6a82fb);",
	"background: linear-gradient(to top right, #ff5f6d, #ffc371);",
	"background: linear-gradient(to top right,  #00b09b, #96c93d);"
];

refresh.addEventListener('click', ()=>{
	consultarPlataformas();
});

function platformContainer(nombre, ip, puerto, color, id){
	return `
		<div class="plt-container">
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

function consultarPlataformas() {
	var http = new XMLHttpRequest();
	var url = 'consulta.php';

	http.onreadystatechange = () => {
		if(http.readyState == XMLHttpRequest.DONE){
			var respuestaPlataformas = JSON.parse(http.responseText);
			for(var platId in respuestaPlataformas){
				if(!platforms[platId]){
					platformsContainer.innerHTML = platformContainer(
						respuestaPlataformas[platId].nombre,
						respuestaPlataformas[platId].ip,
						respuestaPlataformas[platId].puerto,
						colors[colorCount],
						platId
					) + platformsContainer.innerHTML;
					colorCount = (colorCount+1)%4;
					platforms[platId] = respuestaPlataformas[platId];
				}
			}
		}
	}

	http.open("GET", url, true);
	http.send();
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

agregarNuevo.addEventListener('click', ()=>{
	let nombre = document.querySelector('#nombrePlataforma');
	let ip = document.querySelector('#ipPlataforma');
	let puerto = document.querySelector('#puertoPlataforma');
	if(nombre.value != "" && ip.value != "" && puerto.value != ""){
		let http = new XMLHttpRequest();
		let url = 'agregar.php';
		let params = `nombre=${nombre.value}&ip=${ip.value}&puerto=${puerto.value}`;

		if(modifyId) params += `&id=${modifyId}`;

		http.onreadystatechange = () => {
			if(http.readyState === XMLHttpRequest.DONE) {
				try {
					var respuesta = JSON.parse(http.responseText);
					if(respuesta.success){
						console.log("Agregado correctamente");
						nombre.value = "";
						ip.value = "";
						puerto.value = "80";
						if(modifyId) {
							modifyId = null;
							platforms = {};
							platformsContainer.innerHTML = "";
							addContainer.classList.remove('shown');
							isAddContainerShown = false;
							add.querySelector("div p").innerHTML = "Agregar";
						}
						consultarPlataformas();
					}else{
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
	if (document.readyState == "complete"){
		consultarPlataformas();
	}
}