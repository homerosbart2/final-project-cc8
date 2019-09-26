let isAddContainerShown = false;
let isPltContainerShown = true;

const add = document.querySelector('#add');
const pagePlt = document.querySelector('#page-plt');
const bodyContainer = document.querySelector('#body-container');
const back = document.querySelector('#back');
const addContainer = document.querySelector('#add-container');
const go = document.querySelector('#go');

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

go.addEventListener('click', () => {
	showPagePlt();
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