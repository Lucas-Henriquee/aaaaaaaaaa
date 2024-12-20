const planes = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    appearance_time: Math.floor(Math.random() * 30),
    target_time: Math.floor(Math.random() * 30) + 20
}));

planes.sort(() => Math.random() - 0.5);

let timer = 0;
let timerInterval;
let landingCount = 0;
const container = document.querySelector('.main-container');
const runway = document.querySelector('.runway');
const timerDisplay = document.querySelector('.timer');
let runwayClear = true;

function createPlaneElement(plane, altitudeOffset) {
    const div = document.createElement('div');
    div.className = 'plane waiting';
    div.id = 'plane-' + plane.id;
    div.textContent = `✈️${plane.id}`;
    div.style.top = `${30 + altitudeOffset}px`;
    div.style.left = `${runway.offsetLeft}px`;
    container.appendChild(div);
    return div;
}

function moveHorizontallyWithinRunway(planeElem, callback) {
    let posX = runway.offsetLeft;
    let direction = 2;

    const interval = setInterval(() => {
        posX += direction * 2.2; 
        if (posX >= runway.offsetLeft + runway.offsetWidth - 60 || posX <= runway.offsetLeft) {
            direction *= -1;
        }
        planeElem.style.left = posX + 'px';

        if (callback && callback()) {
            clearInterval(interval);
        }
    }, 15); // Intervalo reduzido
}

function moveToRunway(planeElem, runwayX, runwayY, callback) {
    let posX = parseInt(planeElem.style.left) || 0;
    let posY = parseInt(planeElem.style.top) || 0;
    const stepX = (runwayX - posX) / 200; // Passo ajustado
    const stepY = (runwayY - posY) / 200;

    const interval = setInterval(() => {
        posX += stepX;
        posY += stepY;
        planeElem.style.left = posX + 'px';
        planeElem.style.top = posY + 'px';

        if (Math.abs(posX - runwayX) < 1 && Math.abs(posY - runwayY) < 1) {
            clearInterval(interval);
            callback();
        }
    }, 15); // Intervalo reduzido
}

function moveAlongRunway(planeElem, runwayEndX, callback) {
    let posX = parseInt(planeElem.style.left) || 0;
    const stepX = 4.5; // Acelerado

    const interval = setInterval(() => {
        posX += stepX;
        planeElem.style.left = posX + 'px';

        if (posX >= runwayEndX) {
            clearInterval(interval);
            planeElem.remove();
            landingCount++;
            
            // Espera extra após o avião desaparecer antes de liberar a pista
            setTimeout(() => {
                if (landingCount === planes.length) {
                    showMessage();
                }
                callback(); // Libera a pista após o tempo de espera adicional
            }, 2000); // Tempo de espera adicional de 2 segundos
        }
    }, 20); // Intervalo ajustado
}


function showMessage() {
    clearInterval(timerInterval); // Pausa o cronômetro

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <p>Todos os aviões pousaram!</p>
        <p>Tempo total: ${timer}s</p>
        <button onclick="restartSimulation()">Reiniciar</button>
    `;
    document.body.appendChild(messageDiv);
}


function runSimulation() {
    const runwayStartX = runway.offsetLeft; // Início da pista
    const runwayMiddleX = runway.offsetLeft + runway.offsetWidth / 2 - 50; // Meio da pista
    const runwayY = runway.offsetTop + 20; // Altura da pista
    const runwayEndX = runway.offsetLeft + runway.offsetWidth - 50; // Final da pista
    let waitingPlanes = 0;

    planes.forEach((plane, index) => {
        setTimeout(() => {
            const altitudeOffset = waitingPlanes * 30;
            const planeElem = createPlaneElement(plane, altitudeOffset);
            waitingPlanes++;

            moveHorizontallyWithinRunway(planeElem, () => {
                if (runwayClear && timer >= plane.target_time) {
                    runwayClear = false;
                    waitingPlanes--;

                    planeElem.classList.remove('waiting');
                    planeElem.classList.add('landing');

                    // Posição de pouso aleatória entre o início e o meio da pista
                    const randomRunwayX = Math.random() * (runwayMiddleX - runwayStartX) + runwayStartX;

                    moveToRunway(planeElem, randomRunwayX, runwayY, () => {
                        planeElem.classList.remove('landing');
                        planeElem.classList.add('landed');

                        // Avião espera parado na pista por um tempo pequeno
                        setTimeout(() => {
                            planeElem.classList.remove('landed');
                            planeElem.classList.add('departing');
                            moveAlongRunway(planeElem, runwayEndX, () => {
                                runwayClear = true;
                            });
                        }, 1000); // Espera de 1 segundo antes de continuar
                    });
                    return true;
                }
                return false;
            });
        }, plane.appearance_time * 1000 + index * 3000);
    });

    timer = 0;
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = `Tempo: ${timer}s`;
    }, 1000);
}

function restartSimulation() {
    document.querySelectorAll('.plane').forEach(plane => plane.remove());
    clearInterval(timerInterval);
    timerDisplay.textContent = 'Tempo: 0s';
    document.querySelector('.message')?.remove();
    runwayClear = true;
    landingCount = 0;
    runSimulation();
}

runSimulation();
