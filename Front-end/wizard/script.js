var nuevoEvento = {};
let rendererInputs = null;
// Mi idea es que definamos funciones para cada pagina que 
// necesitemos y que retornen la estructura HTML como string.
const getHardwareString = (inputName) => {
    let hardwareInputs = "";
    let cmp = nuevoEvento[`${inputName}Hardware`];
    for(const platId in platforms){
        let hardwareList = platforms[platId].hardware;
        for(const hwId in hardwareList){
            hardwareInputs += `<input type="radio" name="${inputName}" id="hard-${hwId}-${inputName}" value="${platId}-${hwId}"`;
            if(cmp == `${platId}-${hwId}`){
                hardwareInputs += "checked";
                rendererInputs = {
                    platId: platId,
                    hwId: hwId,
                    inputName: inputName
                }
            }
            hardwareInputs += `/>
            <label class= "plt-label" for="hard-${hwId}-${inputName}" onclick="updateInputs(${platId},'${hwId}', '${inputName}')">${platforms[platId].nombre}.${hardwareList[hwId].tag}</label>`;
        }
    }
    return hardwareInputs;
}

const renderFirstPage = () => {
    let platInputs = "";
    for (const platId in platforms) {
        platInputs += `<input type="radio" name="plataforma" id="plt-${platId}" value="${platId}"`;
        if(nuevoEvento.createPlatId == platId) platInputs += "checked";
        platInputs+= `/>
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
                    <input type="radio" name="cmp" id="cmp-1" value="=" ${(nuevoEvento.condicion == "=") ? 'checked' : ''}/>
                    <label class= "cmp-label" for="cmp-1"><i class="fa fa-equals"></i></label>

                    <input type="radio" name="cmp" id="cmp-2" value="!=" ${(nuevoEvento.condicion == "!=") ? 'checked' : ''}/>
                    <label class= "cmp-label" for="cmp-2"><i class="fa fa-not-equal"></i></i></label>

                    <input type="radio" name="cmp" id="cmp-3" value=">" ${(nuevoEvento.condicion == ">") ? 'checked' : ''}/>
                    <label class= "cmp-label" for="cmp-3"><i class="fa fa-greater-than"></i></i></label>

                    <input type="radio" name="cmp" id="cmp-4" value="<" ${(nuevoEvento.condicion == "<") ? 'checked' : ''}/>
                    <label class= "cmp-label" for="cmp-4"><i class="fa fa-less-than"></i></i></label>

                    <input type="radio" name="cmp" id="cmp-5" value=">=" ${(nuevoEvento.condicion == ">=") ? 'checked' : ''}/>
                    <label class= "cmp-label" for="cmp-5"><i class="fa fa-greater-than-equal"></i></label>

                    <input type="radio" name="cmp" id="cmp-6" value="<=" ${(nuevoEvento.condicion == "<=") ? 'checked' : ''}/>
                    <label class= "cmp-label" for="cmp-6"><i class="fa fa-less-than-equal"></i></label> 
                </div>
                <div class = "event-hardware-cmp" id="input-hardware-list">
                </div>
            </div>`;
}

const renderThirdPage = () => {
    return `<div class = "event-hardware">
                <div class = "event-hardware-list">
                    ${getHardwareString('then')}
                </div>
                <div class = "event-hardware-cmp" id="input-then-list">
                </div>
            </div>`;
}
const renderFourPage = () => {
    return `<div class = "event-hardware">
                <div class = "event-hardware-list">
                    ${getHardwareString('else')}
                </div>
                <div class = "event-hardware-cmp" id="input-else-list">
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

                saveEvent(actualPage);
                
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
                
                if(actualPage != pages.length -1){
                    let boton = document.querySelector('#wizard-next')
                    boton.innerHTML = "Siguiente";
                    boton.classList.remove('crear-evento');
                }

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
                        if(rendererInputs){
                            updateInputs(rendererInputs.platId, rendererInputs.hwId, rendererInputs.inputName);
                            rendererInputs = null;
                        }
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

                if(!saveEvent(actualPage)){
                    isTransitioning = false;
                    return;
                }
                
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
                
                if(actualPage == pages.length -1){
                    let boton = document.querySelector('#wizard-next');
                    boton.innerHTML = "Crear Evento";
                    boton.classList.add('crear-evento');
                }

                if (wizardLeftContainer && wizardCenterContainer && wizardRightContainer) {
                    wizardLeftContainer.classList.remove('left');
                    wizardLeftContainer.classList.add('right');
                    wizardLeftContainer.classList.add('hidden');
                    wizardCenterContainer.classList.remove('center');
                    wizardCenterContainer.classList.add('left');
                    wizardRightContainer.classList.remove('right');
                    wizardRightContainer.classList.remove('hidden');
                    wizardRightContainer.classList.add('center');
                    wizardRightContainer.innerHTML = pages[actualPage].renderer();
                    if(rendererInputs){
                        updateInputs(rendererInputs.platId, rendererInputs.hwId, rendererInputs.inputName);
                        rendererInputs = null;
                    }

                    setTimeout(() => {
                        isTransitioning = false;
                    }, TRANSITION_DURATION);
                }
            }else{
                //if(actualPage == pages.length - 1) createEvent();
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

const saveEvent = (actualPage) => {
    let control = false;
    switch(actualPage){
        case 0:
            let createPlatId = document.querySelector('input[name="plataforma"]:checked');
            if(createPlatId){
                nuevoEvento["createPlatId"] = createPlatId.value;
            }else return false;
            break;
        case 1:
            let ifSelection = document.querySelector('input[name="hardware"]:checked');
            let condicion = document.querySelector('input[name="cmp"]:checked');
            if(ifSelection && condicion){
                let splited = ifSelection.value.split("-");
                let freq = document.querySelector('#freq-hardware').value;
                if(freq){
                    control = true;
                    nuevoEvento["hardwareFreq"] = freq;
                }else delete nuevoEvento["hardwareFreq"];

                if(platforms[splited[0]].hardware[splited[1]].type == "input"){
                    let sensor = document.querySelector('#sensor-hardware').value;
                    if(sensor){
                        control = true;
                        nuevoEvento["hardwareSensor"] = sensor;
                    }else delete nuevoEvento["hardwareSensor"];
                }else{
                    control = true;
                    let text = document.querySelector('#text-hardware').value;
                    if(text){
                        nuevoEvento["hardwareText"] = text;
                    }else delete nuevoEvento["hardwareText"];
                    nuevoEvento["hardwareStatus"] = document.querySelector("#status-hardware").checked;
                }

                if(control){
                    nuevoEvento["hardwareHardware"] = ifSelection.value;
                    nuevoEvento["condicion"] = condicion.value;
                }else return false;
            }else return false;
            break;
        case 2:
            let thenSelection = document.querySelector('input[name="then"]:checked');
            if(thenSelection){
                let splited = thenSelection.value.split("-");
                let freq = document.querySelector('#freq-then').value;
                if(freq){
                    control = true;
                    nuevoEvento["thenFreq"] = freq;
                }else delete nuevoEvento["thenFreq"];

                if(platforms[splited[0]].hardware[splited[1]].type == "output"){
                    control = true;
                    let text = document.querySelector('#text-then').value;
                    if(text){
                        nuevoEvento["thenText"] = text;
                    }else delete nuevoEvento["thenText"];
                    nuevoEvento["thenStatus"] = document.querySelector("#status-then").checked;
                }

                if(control) nuevoEvento["thenHardware"] = thenSelection.value;
                else return false;
            }else{
                return false;
            }
            break;
        case 3:
            let elseSelection = document.querySelector('input[name="else"]:checked');
            if(elseSelection){
                let splited = elseSelection.value.split("-");
                let freq = document.querySelector('#freq-else').value;
                if(freq){
                    control = true;
                    nuevoEvento["thenFreq"] = freq;
                }else delete nuevoEvento["thenFreq"];

                if(platforms[splited[0]].hardware[splited[1]].type == "output"){
                    control = true;
                    let text = document.querySelector('#text-else').value;
                    if(text){
                        nuevoEvento["elseText"] = text;
                    }else delete nuevoEvento["elseText"];
                    nuevoEvento["elseStatus"] = document.querySelector("#status-else").checked;
                }

                if(control) nuevoEvento["elseHardware"] = elseSelection.value;
                else return false;
            }else{
                return false;
            }
            break;
    }
    return true;
};

const updateInputs = (platId, hwId, inputName) => {
    let contenedor = document.querySelector(`#input-${inputName}-list`);
    let inputs;
    let isInput;
    let ishardware = false;
    if(platforms[platId].hardware[hwId].type == "input"){
        isInput = true;
        inputs = `<input class = "freq-value" type = "number" placeholder = "Frecuencia" min = "0" id="freq-${inputName}">`;
        if(inputName == "hardware"){
            ishardware = true;
            inputs += `<input class = "freq-value" type = "number" placeholder = "Valor del Sensor" min = "0" id="sensor-${inputName}">`;
        }
    }else{
        isInput = false;
        inputs = `<input class = "freq-value" type = "number" placeholder = "Frecuencia" min = "0" id="freq-${inputName}">
        <input class = "freq-value" type = "text" placeholder = "Text" id="text-${inputName}">
        <span class="switch-container">
            <input type="checkbox" id="status-${inputName}">
            <label for="status-${inputName}">
                <span class="switch-text"></span>
                <span class="indicator"></span>
            </label>
        </span>`;
    }
    contenedor.innerHTML = inputs;
    console.log("hola k ase");
    if(isInput){
        if(nuevoEvento[`${inputName}Freq`])
            document.querySelector(`#freq-${inputName}`).value = nuevoEvento[`${inputName}Freq`];
        if(ishardware)
            if(nuevoEvento[`${inputName}Sensor`])
                document.querySelector(`#sensor-${inputName}`).value = nuevoEvento[`${inputName}Sensor`];
    }else{
        if(nuevoEvento[`${inputName}Freq`])
            document.querySelector(`#freq-${inputName}`).value = nuevoEvento[`${inputName}Freq`];
        if(nuevoEvento[`${inputName}Text`])
            document.querySelector(`#text-${inputName}`).value = nuevoEvento[`${inputName}Text`];
        if(nuevoEvento[`${inputName}Status`])
            document.querySelector(`#status-${inputName}`).checked = nuevoEvento[`${inputName}Status`];
    }
};