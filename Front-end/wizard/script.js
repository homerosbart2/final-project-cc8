// Mi idea es que definamos funciones para cada pagina que 
// necesitemos y que retornen la estructura HTML como string.
const getHardwareString = (inputName) => {
    let hardwareInputs = "";
    for(const platId in platforms){
        let hardwareList = platforms[platId].hardware;
        for(const hwId in hardwareList){
            hardwareInputs += `<input type="radio" name="${inputName}" id="hard-${hwId}-${inputName}" value="${platId}-${hwId}"/>
            <label class= "plt-label" for="hard-${hwId}-${inputName}">${platforms[platId].nombre}.${hardwareList[hwId].tag}</label>`;
        }
    }
    return hardwareInputs;
}

const renderFirstPage = () => {
    let platInputs = "";
    for (const platId in platforms) {
        platInputs += `<input type="radio" name="plataforma" id="plt-${platId}" value="${platId}"/>
                        <label class= "plt-label" for="plt-${platId}">${platforms[platId].nombre}</label>\n`;
    }
    return `<div class = "plt-cont">
               ${platInputs}
            </div>`;
}

const renderSecondPage = () => {
    return `<div class = "event-hardware">
                <div class = "event-hardware-list">
                    ${getHardwareString('hardware')}
                </div>
                <div class = "event-hardware-cmp-list">
                    <input type="radio" name="cmp" id="cmp-1" value="=" checked/>
                    <label class= "cmp-label" for="cmp-1"><i class="fa fa-equals"></i></label>

                    <input type="radio" name="cmp" id="cmp-2" value="!=" />
                    <label class= "cmp-label" for="cmp-2"><i class="fa fa-not-equal"></i></i></label>

                    <input type="radio" name="cmp" id="cmp-3" value=">" />
                    <label class= "cmp-label" for="cmp-3"><i class="fa fa-greater-than"></i></i></label>

                    <input type="radio" name="cmp" id="cmp-4" value="<" />
                    <label class= "cmp-label" for="cmp-4"><i class="fa fa-less-than"></i></i></label>

                    <input type="radio" name="cmp" id="cmp-5" value=">=" />
                    <label class= "cmp-label" for="cmp-5"><i class="fa fa-greater-than-equal"></i></label>

                    <input type="radio" name="cmp" id="cmp-6" value="<=" />
                    <label class= "cmp-label" for="cmp-6"><i class="fa fa-less-than-equal"></i></label> 
                </div>
                <div class = "event-hardware-cmp">
                    <input class = "freq-value" type = "number" placeholder = "Frecuencia" min = "0">
                    <input class = "freq-value" type = "number" placeholder = "Valor del Sensor" min = "0">
                    <input class = "freq-value" type = "text" placeholder = "Frecuencia">
                    <span class="switch-container">
                    <input type="checkbox" id="status-if">
                    <label for="status-if">
                        <span class="switch-text"></span>
                        <span class="indicator"></span>
                    </label>
                </span>
                </div>
            </div>`;
}

const renderThirdPage = () => {
    return `<div class = "event-hardware">
                <div class = "event-hardware-list">
                    ${getHardwareString('then')}
                </div>
                <div class = "event-hardware-cmp">
                    <input class = "freq-value" type = "number" placeholder = "Frecuencia" min = "0">
                    <input class = "freq-value" type = "number" placeholder = "Valor del Sensor" min = "0">
                    <input class = "freq-value" type = "text" placeholder = "Frecuencia">
                    <span class="switch-container">
                    <input type="checkbox" id="status-then">
                    <label for="status-then">
                        <span class="switch-text"></span>
                        <span class="indicator"></span>
                    </label>
                </span>
                </div>
            </div>`;
}
const renderFourPage = () => {
    return `<div class = "event-hardware">
                <div class = "event-hardware-list">
                    ${getHardwareString('else')}
                </div>
                <div class = "event-hardware-cmp">
                    <input class = "freq-value" type = "number" placeholder = "Frecuencia" min = "0">
                    <input class = "freq-value" type = "number" placeholder = "Valor del Sensor" min = "0">
                    <input class = "freq-value" type = "text" placeholder = "Frecuencia">
                    <span class="switch-container">
                    <input type="checkbox" id="status-else">
                    <label for="status-else">
                        <span class="switch-text"></span>
                        <span class="indicator"></span>
                    </label>
                </span>
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