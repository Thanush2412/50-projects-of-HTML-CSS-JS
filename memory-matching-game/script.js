const cards = document.querySelectorAll('.card');
const movesCount = document.getElementById('moves-count');
const timeValue = document.getElementById('time');
const restartButton = document.getElementById('restart');
const playAgainButton = document.getElementById('play-again');
const resultScreen = document.getElementById('result');
const finalMoves = document.getElementById('final-moves');
const finalTime = document.getElementById('final-time');

let moves = 0;
let time = 0;
let timer;
let firstCard = null;
let secondCard = null;
let flippedCards = 0;
let canFlip = true;

const animals = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁'];

function startGame() {
    moves = 0;
    time = 0;
    flippedCards = 0;
    firstCard = null;
    secondCard = null;
    canFlip = true;
    
    movesCount.textContent = '0';
    timeValue.textContent = '00:00';
    resultScreen.classList.add('hide');
    
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
    
    resetCards();
    setupCards();
}

function resetCards() {
    cards.forEach(card => {
        card.classList.remove('flipped', 'matched');
        card.removeEventListener('click', flipCard);
        card.addEventListener('click', flipCard);
    });
}

function setupCards() {
    let cardPairs = [...animals, ...animals];
    shuffle(cardPairs);
    
    cards.forEach((card, index) => {
        card.style.order = index;
        card.querySelector('.card-back').textContent = cardPairs[index];
        card.setAttribute('data-animal', cardPairs[index]);
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function flipCard() {
    if (!canFlip) return;
    if (this === firstCard) return;
    if (this.classList.contains('matched')) return;
    
    this.classList.add('flipped');
    
    if (!firstCard) {
        firstCard = this;
        return;
    }
    
    secondCard = this;
    canFlip = false;
    moves++;
    movesCount.textContent = moves;
    
    checkMatch();
}

function checkMatch() {
    let isMatch = firstCard.getAttribute('data-animal') === secondCard.getAttribute('data-animal');
    
    if (isMatch) {
        markAsMatched();
    } else {
        unflipCards();
    }
}

function markAsMatched() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    flippedCards += 2;
    resetTurn();
    
    if (flippedCards === cards.length) {
        setTimeout(showResult, 500);
    }
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetTurn();
    }, 1000);
}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    canFlip = true;
}

function updateTimer() {
    time++;
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    timeValue.textContent = minutes + ':' + seconds;
}

function showResult() {
    clearInterval(timer);
    finalMoves.textContent = moves;
    finalTime.textContent = timeValue.textContent;
    resultScreen.classList.remove('hide');
}

restartButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);

startGame();
