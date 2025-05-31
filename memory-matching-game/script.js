const cards = document.querySelectorAll('.card');
const movesCount = document.getElementById('moves-count');
const timeValue = document.getElementById('time');
const resultScreen = document.getElementById('result');
const resultMoves = document.getElementById('result-moves');
const resultTime = document.getElementById('result-time');
const restartButton = document.getElementById('restart');
const playAgainButton = document.getElementById('play-again');

let moves = 0;
let time = 0;
let timer = null;
let firstCard = null;
let secondCard = null;
let isLocked = false;
let matchedPairs = 0;

function startGame() {
    resetGame();
    shuffleCards();
    startTimer();
}

function resetGame() {
    moves = 0;
    time = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    isLocked = false;
    
    movesCount.textContent = moves;
    timeValue.textContent = '00:00';
    
    cards.forEach(card => {
        card.classList.remove('flipped', 'matched');
    });
    
    resultScreen.classList.remove('show');
    
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function shuffleCards() {
    let positions = Array.from(Array(cards.length).keys());
    
    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    cards.forEach((card, index) => {
        card.style.order = positions[index];
    });
}

function startTimer() {
    timer = setInterval(() => {
        time++;
        updateTimer();
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    
    const minutesText = minutes < 10 ? `0${minutes}` : minutes;
    const secondsText = seconds < 10 ? `0${seconds}` : seconds;
    
    timeValue.textContent = `${minutesText}:${secondsText}`;
}

function flipCard() {
    if (isLocked) return;
    if (this === firstCard) return;
    
    this.classList.add('flipped');
    
    if (!firstCard) {
        firstCard = this;
        return;
    }
    
    secondCard = this;
    isLocked = true;
    
    checkForMatch();
    updateMoves();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.card === secondCard.dataset.card;
    
    if (isMatch) {
        disableCards();
        matchedPairs++;
        
        if (matchedPairs === cards.length / 2) {
            endGame();
        }
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    resetCardState();
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        
        resetCardState();
    }, 1000);
}

function resetCardState() {
    firstCard = null;
    secondCard = null;
    isLocked = false;
}

function updateMoves() {
    moves++;
    movesCount.textContent = moves;
}

function endGame() {
    clearInterval(timer);
    
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    
    const minutesText = minutes < 10 ? `0${minutes}` : minutes;
    const secondsText = seconds < 10 ? `0${seconds}` : seconds;
    
    resultMoves.textContent = moves;
    resultTime.textContent = `${minutesText}:${secondsText}`;
    
    setTimeout(() => {
        resultScreen.classList.add('show');
    }, 1000);
}

cards.forEach(card => {
    card.addEventListener('click', flipCard);
});

restartButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);

window.onload = startGame;
