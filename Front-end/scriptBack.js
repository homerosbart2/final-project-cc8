let platforms = {};

const refresh = document.querySelector('#refresh');
const agregarNuevo = document.querySelector('#agregarNuevo');

const colors = [
	"background: linear-gradient(to top right, #ddd6f3, #faaca8);",
	"background: linear-gradient(to top left,  #fc5c7d, #6a82fb);",
	"background: linear-gradient(to top right, #f7ff00, #db36a4);",
	"background: linear-gradient(to top right,  #00b09b, #96c93d);"
];

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
			var i = 0;
			for(var nombre in respuestaPlataformas){
				if(!platforms[nombre]){
					platformsContainer.innerHTML = platformContainer(
						nombre,
						respuestaPlataformas[nombre].ip,
						respuestaPlataformas[nombre].puerto,
						colors[i]
					) + platformsContainer.innerHTML;
					i = (i+1)%4;
					platforms[nombre] = respuestaPlataformas[nombre];
				}
			}
		}
	}

	http.open("GET", url, true);
	http.send();
}

agregarNuevo.addEventListener('click', ()=>{
	let nombre = document.querySelector('#nombrePlataforma');
	let ip = document.querySelector('#ipPlataforma');
	let puerto = document.querySelector('#puertoPlataforma');
	if(nombre.value != "" && ip.value != "" && puerto.value != ""){
		let http = new XMLHttpRequest();
		let url = 'agregar.php';
		let params = `nombre=${nombre.value}&ip=${ip.value}&puerto=${puerto.value}`;

		http.onreadystatechange = () => {
			/*var respuesta = JSON.parse(http.responseText);
			if(respuesta.success){
				console.log("Agregado correctamente");
				consultarPlataformas();
			}else{
				console.log("Error");
			}*/
			console.log(http.responseText);
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