let isAddContainerShown = false;

const add = document.querySelector('#add');
const pagePlt = document.querySelector('#page-plt');
const bodyContainer = document.querySelector('#body-container');
const platformsContainer = document.querySelector("#platforms-container");

const showPagePlt = () => {
	bodyContainer.classList.remove('shown');
	pagePlt.classList.add('shown');
}

add.addEventListener('click', () => {
	showPagePlt();
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