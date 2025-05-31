const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const millisecondsElement = document.getElementById('milliseconds');
const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const resetButton = document.getElementById('reset-btn');
const lapsList = document.getElementById('laps-list');

let timer = null;
let isRunning = false;
let startTime = 0;
let elapsedTime = 0;
let lapCount = 0;

function startTimer() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        timer = setInterval(updateDisplay, 10);
        isRunning = true;
        
        startButton.textContent = 'Lap';
        stopButton.disabled = false;
        resetButton.disabled = false;
    } else {
        recordLap();
    }
}

function stopTimer() {
    clearInterval(timer);
    isRunning = false;
    
    startButton.textContent = 'Start';
    stopButton.disabled = true;
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    elapsedTime = 0;
    
    minutesElement.textContent = '00';
    secondsElement.textContent = '00';
    millisecondsElement.textContent = '00';
    
    startButton.textContent = 'Start';
    stopButton.disabled = true;
    resetButton.disabled = true;
    
    lapsList.innerHTML = '';
    lapCount = 0;
}

function updateDisplay() {
    elapsedTime = Date.now() - startTime;
    
    let mins = Math.floor(elapsedTime / 60000);
    let secs = Math.floor((elapsedTime % 60000) / 1000);
    let ms = Math.floor((elapsedTime % 1000) / 10);
    
    mins = mins < 10 ? '0' + mins : mins;
    secs = secs < 10 ? '0' + secs : secs;
    ms = ms < 10 ? '0' + ms : ms;
    
    minutesElement.textContent = mins;
    secondsElement.textContent = secs;
    millisecondsElement.textContent = ms;
}

function recordLap() {
    lapCount++;
    
    let lapTime = minutesElement.textContent + ':' + 
                 secondsElement.textContent + ':' + 
                 millisecondsElement.textContent;
    
    let lapItem = document.createElement('li');
    lapItem.innerHTML = '<span class="lap-number">Lap ' + lapCount + ':</span> ' + 
                        '<span>' + lapTime + '</span>';
    
    lapsList.prepend(lapItem);
}

startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', stopTimer);
resetButton.addEventListener('click', resetTimer);
