let isAddContainerShown = false;
let isPltContainerShown = true;

const add = document.querySelector('#add');
const pagePlt = document.querySelector('#page-plt');
const bodyContainer = document.querySelector('#body-container');
const back = document.querySelector('#back');
const addContainer = document.querySelector('#add-container');
const go = document.querySelector('#go');

const showPagePlt = () => {
	bodyContainer.classList.remove('shown');
	pagePlt.classList.add('shown');
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

document.addEventListener('DOMContentLoaded', function(event) {
	document.querySelector('#flip-turn-back').style.visibility ='visible';
	document.querySelector('#flip-turn-front').style.visibility = 'visible';
	
	document.querySelector('#flip-turn-back').onclick = function(){
		document.querySelector('#flip-card').classList.toggle('do-flip');
	};

	document.querySelector('#flip-turn-front').onclick = function(){
		document.querySelector('#flip-card').classList.toggle('do-flip');
	};
});