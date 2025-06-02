
const levelButtons = document.querySelectorAll('.level-btn');
const startButton = document.getElementById('start-btn');
const hintButton = document.getElementById('hint-btn');
const skipButton = document.getElementById('skip-btn');
const wordImage = document.querySelector('.word-image');
const wordHint = document.querySelector('.word-hint');
const letterInput = document.querySelector('.letter-input');
const keyboard = document.querySelector('.keyboard');
const scoreElement = document.getElementById('score');
const hintsLeftElement = document.getElementById('hints-left');
const wordsCompletedElement = document.getElementById('words-completed');
const resultModal = document.getElementById('result-modal');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const resultWord = document.getElementById('result-word');
const continueButton = document.getElementById('continue-btn');


let currentLevel = 'easy';
let currentWord = '';
let currentWordIndex = 0;
let score = 0;
let hintsLeft = 3;
let wordsCompleted = 0;
let wordGenerator = null;
let revealedLetters = 0;


const words = {
  easy: [
    { word: 'cat', image: 'cat.jpg', hint: 'A small furry animal that meows' },
    { word: 'dog', image: 'dog.jpg', hint: 'Man\'s best friend' },
    { word: 'sun', image: 'sun.jpg', hint: 'It rises in the east' },
    { word: 'hat', image: 'hat.jpg', hint: 'You wear it on your head' },
    { word: 'ball', image: 'ball.jpg', hint: 'A round toy you can throw' },
    { word: 'tree', image: 'tree.jpg', hint: 'It has leaves and branches' },
    { word: 'fish', image: 'fish.jpg', hint: 'It swims in water' },
    { word: 'book', image: 'book.jpg', hint: 'You read it' }
  ],
  medium: [
    { word: 'apple', image: 'apple.jpg', hint: 'A fruit that keeps the doctor away' },
    { word: 'house', image: 'house.jpg', hint: 'A place where people live' },
    { word: 'chair', image: 'chair.jpg', hint: 'You sit on it' },
    { word: 'clock', image: 'clock.jpg', hint: 'It tells the time' },
    { word: 'flower', image: 'flower.jpg', hint: 'It grows in gardens' },
    { word: 'pencil', image: 'pencil.jpg', hint: 'You write with it' },
    { word: 'rabbit', image: 'rabbit.jpg', hint: 'A furry animal with long ears' },
    { word: 'school', image: 'school.jpg', hint: 'A place where children learn' }
  ],
  hard: [
    { word: 'elephant', image: 'elephant.jpg', hint: 'A large animal with a trunk' },
    { word: 'computer', image: 'computer.jpg', hint: 'An electronic device for processing data' },
    { word: 'umbrella', image: 'umbrella.jpg', hint: 'It keeps you dry in the rain' },
    { word: 'dinosaur', image: 'dinosaur.jpg', hint: 'An extinct reptile' },
    { word: 'chocolate', image: 'chocolate.jpg', hint: 'A sweet brown food' },
    { word: 'butterfly', image: 'butterfly.jpg', hint: 'An insect with colorful wings' },
    { word: 'telephone', image: 'telephone.jpg', hint: 'A device for talking to people far away' },
    { word: 'vegetable', image: 'vegetable.jpg', hint: 'A plant food like carrots or broccoli' }
  ]
};


function createPlaceholderImage(word) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 200;
  canvas.height = 200;
  
  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Text
  ctx.fillStyle = '#999';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Image for: ${word}`, canvas.width / 2, canvas.height / 2);
  
  return canvas.toDataURL();
}


function createKeyboard() {
  const keys = 'abcdefghijklmnopqrstuvwxyz'.split('');
  keyboard.innerHTML = '';
  
  keys.forEach(key => {
    const keyElement = document.createElement('div');
    keyElement.className = 'key';
    keyElement.textContent = key;
    keyElement.dataset.key = key;
    
    keyElement.addEventListener('click', () => {
      handleKeyPress(key);
    });
    
    keyboard.appendChild(keyElement);
  });
}


function* wordSequenceGenerator(wordList) {
  
  const shuffled = [...wordList];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Destructuring swap
  }
  
  
  for (let i = 0; i < shuffled.length; i++) {
    yield { word: shuffled[i], index: i };
  }
  
  
  yield { completed: true };
}


function startGame() {
  
  score = 0;
  hintsLeft = 3;
  wordsCompleted = 0;
  revealedLetters = 0;
  
  
  scoreElement.textContent = score;
  hintsLeftElement.textContent = hintsLeft;
  wordsCompletedElement.textContent = wordsCompleted;
  
  
  wordGenerator = wordSequenceGenerator(words[currentLevel]);
  
  
  nextWord();
  
  
  hintButton.disabled = false;
  skipButton.disabled = false;
  startButton.textContent = 'Restart Game';
  
  
  createKeyboard();
}


function nextWord() {
  const next = wordGenerator.next().value;
  
  
  if (next.completed) {
    showGameComplete();
    return;
  }
  
  const { word: wordObj, index } = next;
  currentWord = wordObj.word;
  currentWordIndex = index;
  
  
  displayWord(wordObj);
  
  
  revealedLetters = 0;
  
  
  document.querySelectorAll('.key').forEach(key => {
    key.classList.remove('used');
  });
  
  
  speakWord(currentWord);
}

function displayWord(wordObj) {
  
  wordImage.style.backgroundImage = `url('${createPlaceholderImage(wordObj.word)}')`;
  
  
  wordHint.innerHTML = `<p>Hint: ${wordObj.hint}</p>`;
  
  
  letterInput.innerHTML = '';
  for (let i = 0; i < wordObj.word.length; i++) {
    const letterBox = document.createElement('div');
    letterBox.className = 'letter-box';
    letterBox.dataset.index = i;
    letterInput.appendChild(letterBox);
  }
}

function handleKeyPress(key) {
  
  let found = false;
  const letterBoxes = document.querySelectorAll('.letter-box');
  
  for (let i = 0; i < currentWord.length; i++) {
    if (currentWord[i] === key) {
      letterBoxes[i].textContent = key;
      letterBoxes[i].classList.add('correct');
      found = true;
    }
  }
  
  
  document.querySelector(`.key[data-key="${key}"]`).classList.add('used');
  
  
  if (found) {
    
    const allFilled = Array.from(letterBoxes).every(box => box.textContent);
    if (allFilled) {
      handleWordComplete(true);
    }
  } else {
  }
}

function getHint() {
  if (hintsLeft <= 0) return;
  
  const letterBoxes = document.querySelectorAll('.letter-box');
  const emptyBoxes = Array.from(letterBoxes).filter(box => !box.textContent);
  
  if (emptyBoxes.length > 0) {
    
    const boxToReveal = emptyBoxes[0];
    const index = parseInt(boxToReveal.dataset.index);
    const letter = currentWord[index];
    
    
    boxToReveal.textContent = letter;
    boxToReveal.classList.add('correct');
    document.querySelector(`.key[data-key="${letter}"]`).classList.add('used');
    
    
    hintsLeft--;
    hintsLeftElement.textContent = hintsLeft;
    revealedLetters++;
    
    
    const allFilled = Array.from(letterBoxes).every(box => box.textContent);
    if (allFilled) {
      handleWordComplete(false); // No points for completing with hints
    }
  }
}


function skipWord() {
  handleWordComplete(false);
}


function handleWordComplete(earnPoints) {
  
  if (earnPoints) {
    
    const difficultyBonus = currentLevel === 'easy' ? 1 : currentLevel === 'medium' ? 2 : 3;
    const hintPenalty = revealedLetters * 0.5;
    const wordPoints = Math.max(1, difficultyBonus - hintPenalty);
    
    score += wordPoints;
    scoreElement.textContent = score;
  }
  
  
  wordsCompleted++;
  wordsCompletedElement.textContent = wordsCompleted;
  
  
  resultWord.textContent = currentWord;
  
  if (earnPoints) {
    resultTitle.textContent = 'Correct!';
    resultMessage.textContent = 'You spelled the word correctly!';
  } else {
    resultTitle.textContent = 'Word Skipped';
    resultMessage.textContent = 'Moving on to the next word.';
  }
  
  
  resultModal.style.display = 'flex';
}


function showGameComplete() {
  resultTitle.textContent = 'Game Complete!';
  resultMessage.textContent = `You completed ${wordsCompleted} words with a score of ${score}!`;
  resultWord.textContent = '';
  resultModal.style.display = 'flex';
  
  
  hintButton.disabled = true;
  skipButton.disabled = true;
}


function speakWord(word) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.8; // Slightly slower
    window.speechSynthesis.speak(utterance);
  }
}


levelButtons.forEach(button => {
  button.addEventListener('click', () => {
    
    levelButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    currentLevel = button.dataset.level;
  });
});

startButton.addEventListener('click', startGame);
hintButton.addEventListener('click', getHint);
skipButton.addEventListener('click', skipWord);
continueButton.addEventListener('click', () => {
  resultModal.style.display = 'none';
  nextWord();
});


createKeyboard();


document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (/^[a-z]$/.test(key)) {
    handleKeyPress(key);
  }
});
