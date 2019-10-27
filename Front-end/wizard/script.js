// Mi idea es que definamos funciones para cada pagina que 
// necesitemos y que retornen la estructura HTML como string.
const renderFirstPage = () => {
    return `<div class = "plt-cont">
                <input type="radio" name="plataforma" id="plt-1" value="plat" checked />
                <label class= "plt-label" for="plt-1">Plataforma</label>
                  
                <input type="radio" name="plataforma" id="plt-2" value="plat" />
                <label class= "plt-label" for="plt-2">Plataforma</label>
                  
                <input type="radio" name="plataforma" id="plt-3" value="plat" />
                <label class= "plt-label" for="plt-3">Plataforma</label>

                <input type="radio" name="plataforma" id="plt-4" value="plat" />
                <label class= "plt-label" for="plt-4">Plataforma</label>

                <input type="radio" name="plataforma" id="plt-5" value="plat" />
                <label class= "plt-label" for="plt-5">Plataforma</label>

                <input type="radio" name="plataforma" id="plt-6" value="plat" />
                <label class= "plt-label" for="plt-6">Plataforma</label>
            </div>`;
}

const renderSecondPage = () => {
    return `<div class = "event-hardware">
                <div class = "event-hardware-list">
                    <input type="radio" name="hardware" id="hard-1" value="hard" checked />
                    <label class= "plt-label" for="hard-1">Hardware</label>
                      
                    <input type="radio" name="hardware" id="hard-2" value="hard" />
                    <label class= "plt-label" for="hard-2">Hardware</label>
                </div>
                <div class = "event-hardware-cmp">
                    <input class = "freq-value" type = "number" placeholder = "Frecuencia" min = "0">
                    <input class = "freq-value" type = "number" placeholder = "Valor del Sensor" min = "0">
                    <input class = "freq-value" type = "text" placeholder = "Frecuencia">
                </div>
            </div>`;
}

const renderThirdPage = () => {
    return `<div class = "event-hardware">
                <div class = "event-hardware-list">
                    <input type="radio" name="theb" id="then-1" value="hard" checked />
                    <label class= "plt-label" for="then-1">Hardware</label>
                      
                    <input type="radio" name="then" id="then-2" value="hard" />
                    <label class= "plt-label" for="then-2">Hardware</label>
                </div>
                <div class = "event-hardware-cmp">
                    <input class = "freq-value" type = "number" placeholder = "Frecuencia" min = "0">
                    <input class = "freq-value" type = "number" placeholder = "Valor del Sensor" min = "0">
                    <input class = "freq-value" type = "text" placeholder = "Frecuencia">
                </div>
            </div>`;
}
const renderFourPage = () => {
    return `<div class = "event-hardware">
                <div class = "event-hardware-list">
                    <input type="radio" name="else" id="else-1" value="hard" checked />
                    <label class= "plt-label" for="else-1">Hardware</label>
                      
                    <input type="radio" name="else" id="else-2" value="hard" />
                    <label class= "plt-label" for="else-2">Hardware</label>
                </div>
                <div class = "event-hardware-cmp">
                    <input class = "freq-value" type = "number" placeholder = "Frecuencia" min = "0">
                    <input class = "freq-value" type = "number" placeholder = "Valor del Sensor" min = "0">
                    <input class = "freq-value" type = "text" placeholder = "Frecuencia">
                </div>
            </div>`;
}

// Deberíamos de definir las páginas así para que sea 
// escalable. Yo me encargo de que funcione para n
// páginas.
const pages = [
    {
        title: 'Seleccionar Plt',
        renderer: renderFirstPage
    },
    {
        title: 'Hardware',
        renderer: renderSecondPage
    },
    {
        title: 'Then',
        renderer: renderThirdPage
    },
    {
        title: 'Else',
        renderer: renderFourPage
    }
]

// No tenés que entender este código, solo tenés que declarar
// las funciones y meterlas en el arreglo 'pages' como en el 
// ejemplo.
var cargarWizard = () => {
    if (document.readyState === 'complete') {
        const TRANSITION_DURATION = 200;
        let actualPage = 0;
        let isTransitioning = false;
        
        const wizardBodyContainer = document.querySelector('#wizard-body-container');
        const wizardStepsContainer = document.querySelector('#wizard-steps-container');

        const handleWizardPrevoiusClick = () => {
            if (!isTransitioning && actualPage > 0) {
                isTransitioning = true;
                
                actualPage--;

                const nextWizardStep = wizardStepsContainer.querySelector(`#wizard-step-${actualPage + 1}`);
                const actualWizardStep = wizardStepsContainer.querySelector(`#wizard-step-${actualPage}`);

                if (nextWizardStep) {
                    nextWizardStep.classList.remove('selected');
                }

                if (actualWizardStep) {
                    actualWizardStep.classList.add('selected');
                }

                const wizardLeftContainer = wizardBodyContainer.querySelector('.left');
                const wizardCenterContainer = wizardBodyContainer.querySelector('.center');
                const wizardRightContainer = wizardBodyContainer.querySelector('.right');
    
                if (wizardLeftContainer && wizardCenterContainer && wizardRightContainer) {
                    wizardLeftContainer.classList.remove('left');
                    wizardLeftContainer.classList.remove('hidden');
                    wizardLeftContainer.classList.add('center');
                    wizardCenterContainer.classList.remove('center');
                    wizardCenterContainer.classList.add('right');
                    wizardRightContainer.classList.remove('right');
                    wizardRightContainer.classList.add('left');
                    wizardRightContainer.classList.add('hidden');
                    if (actualPage > 0) {
                        wizardRightContainer.innerHTML = pages[actualPage - 1].renderer();
                    }

                    setTimeout(() => {
                        isTransitioning = false;
                    }, TRANSITION_DURATION);
                }
            }
        }
    
        const handleWizardNextClick = () => {
            if (!isTransitioning && actualPage < pages.length - 1) {
                isTransitioning = true;
                
                actualPage++;

                const previousWizardStep = wizardStepsContainer.querySelector(`#wizard-step-${actualPage - 1}`);
                const actualWizardStep = wizardStepsContainer.querySelector(`#wizard-step-${actualPage}`);

                if (previousWizardStep) {
                    previousWizardStep.classList.remove('selected');
                }

                if (actualWizardStep) {
                    actualWizardStep.classList.add('selected');
                }

                const wizardLeftContainer = wizardBodyContainer.querySelector('.left');
                const wizardCenterContainer = wizardBodyContainer.querySelector('.center');
                const wizardRightContainer = wizardBodyContainer.querySelector('.right');
    
                if (wizardLeftContainer && wizardCenterContainer && wizardRightContainer) {
                    wizardLeftContainer.classList.remove('left');
                    wizardLeftContainer.classList.add('right');
                    wizardLeftContainer.classList.add('hidden');
                    wizardCenterContainer.classList.remove('center');
                    wizardCenterContainer.classList.add('left');
                    wizardRightContainer.classList.remove('right');
                    wizardRightContainer.classList.remove('hidden');
                    wizardRightContainer.classList.add('center');
                    if (actualPage < pages.length - 1) {
                        wizardLeftContainer.innerHTML = pages[actualPage + 1].renderer();
                    }

                    setTimeout(() => {
                        isTransitioning = false;
                    }, TRANSITION_DURATION);
                }
            }
        }

        if (wizardBodyContainer) {
            const wizardPrevious = document.querySelector('#wizard-previous');
            const wizardNext = document.querySelector('#wizard-next');

            if (pages.length > 0) {
                wizardBodyContainer.querySelector('.center').innerHTML = pages[actualPage].renderer();

                if (pages.length > 1) {
                    wizardBodyContainer.querySelector('.right').innerHTML = pages[actualPage + 1].renderer();
                }
            }

            if (wizardPrevious) {
                wizardPrevious.addEventListener('click', handleWizardPrevoiusClick);
            }

            if (wizardNext) {
                wizardNext.addEventListener('click', handleWizardNextClick);
            }
        }

        if (wizardStepsContainer) {
            const wizardSteps = pages.reduce((wizardStepsHTML, page, index) => {
                return wizardStepsHTML + `<span id="wizard-step-${index}" class="wizard-step${!index ? ' selected' : ''}"><span class="wizard-step-title">${page.title}</span></span>`;
            }, '');

            wizardStepsContainer.innerHTML += wizardSteps;
        }
    }
  };