let isAddContainerShown = false;
let isPltContainerShown = true;
let isEventContainerShown = false;
let isEventListContainerShown = false;

const add = document.querySelector('#add');
const pagePlt = document.querySelector('#page-plt');
const bodyContainer = document.querySelector('#body-container');
const back = document.querySelector('#back');
const addContainer = document.querySelector('#add-container');
const go = document.querySelector('#go');
const new_events = document.querySelector('#new-events');
const eventos = document.querySelector('#eventos'); 
const back1 = document.querySelector('#back1');
const show_events = document.querySelector('#show-events');
const lista_eventos = document.querySelector('#lista-eventos');
const back2 = document.querySelector('#back2');
const showPagePlt = (id) => {
	if(id){
		if(platforms[id].hardware){
			hardwaresContainer.innerHTML = hardwareContainer(id);
			loadFlipButton();
			bodyContainer.classList.remove('shown');
			pagePlt.classList.add('shown');
		}
	}
	else{
		bodyContainer.classList.remove('shown');
		pagePlt.classList.add('shown');
	}
}

const showAdd = () => {

}


const showPlatformsContainer = () => {
	bodyContainer.classList.add('shown');
	pagePlt.classList.remove('shown');
}

back.addEventListener('click', () => {
	showPlatformsContainer();
	
});

back1.addEventListener('click', () => {
	bodyContainer.classList.add('shown');
	eventos.classList.remove('shown');
	isEventContainerShown = false;
});

back2.addEventListener('click', () => {
	bodyContainer.classList.add('shown');
	lista_eventos.classList.remove('shown');
	isEventListContainerShown = false;
})
show_events.addEventListener('click', () => {
	if (isEventListContainerShown) {
		lista_eventos.classList.remove('shown');
		isEventListContainerShown = false;
	}else{
		consultarEventos();
		lista_eventos.classList.add('shown');
		isEventListContainerShown = true;
	}

})
new_events.addEventListener('click', () =>{
	if (isEventContainerShown) {
		eventos.classList.remove('shown');
		isEventContainerShown = false;
	}else{
		if(updateEvent){
			nuevoEvento = {};
			regresar(0);
		}
		updateEvent = false;
		eventos.classList.add('shown');
		isEventContainerShown = true;
	}
});

add.addEventListener('click', () => {
	modifyId = null;
	document.querySelector('#nombrePlataforma').value = "";
	document.querySelector('#ipPlataforma').value = "";
	document.querySelector('#puertoPlataforma').value = "80";
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

function loadFlipButton() {
	document.querySelectorAll('.flip-turn-back').forEach((turnBack) => {
		turnBack.style.visibility ='visible';
		turnBack.onclick = function(){
			turnBack.parentElement.parentElement.classList.toggle('do-flip');
		};
	});
	document.querySelectorAll('.flip-turn-front').forEach((turnFront) => {
		turnFront.style.visibility ='visible';
		turnFront.onclick = function(){
			turnFront.parentElement.parentElement.classList.toggle('do-flip');
		};
	});
}