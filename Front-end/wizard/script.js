// Mi idea es que definamos funciones para cada pagina que 
// necesitemos y que retornen la estructura HTML como string.
const renderFirstPage = () => {
    return `<div>Shinshé</div>`;
}

const renderSecondPage = () => {
    return `<div>Wu</div>`;
}

// Deberíamos de definir las páginas así para que sea 
// escalable. Yo me encargo de que funcione para n
// páginas.
const pages = [
    {
        title: 'primera página',
        renderer: renderFirstPage
    },
    {
        title: 'segunda página',
        renderer: renderSecondPage
    },
    {
        title: 'tercera página',
        renderer: renderSecondPage
    },
    {
        title: 'cuarta página',
        renderer: renderFirstPage
    }
]

// No tenés que entender este código, solo tenés que declarar
// las funciones y meterlas en el arreglo 'pages' como en el 
// ejemplo.
document.onreadystatechange = () => {
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