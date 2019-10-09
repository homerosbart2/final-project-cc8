const grafico = document.querySelector('#chart-container');

document.querySelector('#open-modal').addEventListener('click', () => {
    document.querySelector('#modal-1').classList.add('shown');
});

function showModal(idPlat, idHW){
    search_id_plat = idPlat;
    search_id_hw = idHW;
    document.querySelector('#modal-1').classList.add('shown');
}

document.querySelector('.modal-container .close-container').addEventListener('click', (event) => {
    search_id_hw = null;
    search_id_plat = null;
    event.currentTarget.parentElement.parentElement.classList.remove('shown');
});