let isAddContainerShown = false;

const add = document.querySelector('#add');
const refresh = document.querySelector('#refresh');
const platformsContainer = document.querySelector("#platforms-container");
let platforms = {};

add.addEventListener('click', () => {
	const addContainer = document.querySelector('#add-container');
	if(isAddContainerShown) {
		addContainer.classList.remove('shown');
		isAddContainerShown = false;
	 add.querySelector("div p").innerHTML = "Agregar";
	} else {
		addContainer.classList.add('shown');
		isAddContainerShown = true;
	 add.querySelector("div p").innerHTML = "Cancelar";
	} 
	
});

refresh.addEventListener('click', ()=>{
	consultarPlataformas();
});

function platformContainer(nombre, ip, puerto){
	return `
		<div class="plt-container">
			<div class="col">
				<div class="card shadow--sm">
					<div class="card--body">
						<p class="card--text card--size-state">${nombre}</p>
						<p class="card--text">${ip}:${puerto}</p>
					</div>
				</div>
			</div>
			<div class="col">
				<div id="" class="card1 button shadow--md">
					<div class="card--body">
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
			for(var nombre in respuestaPlataformas){
				if(!platforms[nombre]){
					platformsContainer.innerHTML += platformContainer(
						nombre,
						respuestaPlataformas[nombre].ip,
						respuestaPlataformas[nombre].puerto
					);
					platforms[nombre] = respuestaPlataformas[nombre];
				}
			}
		}
	}

	http.open("GET", url, true);
	http.send();
}

document.onreadystatechange = () => {
	if (document.readyState == "complete"){
		consultarPlataformas();
	}
}