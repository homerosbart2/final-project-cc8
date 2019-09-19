let isAddContainerShown = false;

const add = document.querySelector('#add');

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
	
})