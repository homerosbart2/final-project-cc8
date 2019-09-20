let isAddContainerShown = false;

const add = document.querySelector('#add');
const refresh = document.querySelector('#refresh');
const platformsContainer = document.querySelector("#platforms-container");
let platforms = {};
let colors = [
	"background: linear-gradient(to top right, #ddd6f3, #faaca8);",
	"background: linear-gradient(to top right, #fc00ff, #00dbde);",
	"background: linear-gradient(to top right, #4ac29a, #bdfff3);",
	"background: linear-gradient(to top right, #ee9ca7, #ffdde1);"
];

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

function platformContainer(nombre, ip, puerto, color){
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
					<div class="card--body">
						<p class="card--text card--size-state1">Modificar</p>
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
			var i = 0;
			for(var nombre in respuestaPlataformas){
				if(!platforms[nombre]){
					platformsContainer.innerHTML += platformContainer(
						nombre,
						respuestaPlataformas[nombre].ip,
						respuestaPlataformas[nombre].puerto,
						colors[i]
					);
					i = (i+1)%4;
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