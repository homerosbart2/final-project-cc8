document.querySelector('#open-modal').addEventListener('click', () => {
    document.querySelector('#modal-1').classList.add('shown');
});

document.querySelector('.modal-container .close-container').addEventListener('click', (event) => {
    event.currentTarget.parentElement.parentElement.classList.remove('shown');
});