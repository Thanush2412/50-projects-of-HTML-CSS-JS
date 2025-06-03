const textDisplay = document.getElementById('text-display');
const textInput = document.getElementById('text-input');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const timeDisplay = document.getElementById('time-display');
const wpmDisplay = document.getElementById('wpm');
const cpmDisplay = document.getElementById('cpm');
const accuracyDisplay = document.getElementById('accuracy');
const difficultySelect = document.getElementById('difficulty');
const timeSelect = document.getElementById('time');
const resultModal = document.getElementById('result-modal');
const closeModal = document.querySelector('.close-modal');
const resultWpm = document.getElementById('result-wpm');
const resultCpm = document.getElementById('result-cpm');
const resultAccuracy = document.getElementById('result-accuracy');
const correctWords = document.getElementById('correct-words');
const incorrectWords = document.getElementById('incorrect-words');
const timeTaken = document.getElementById('time-taken');
const tryAgainBtn = document.getElementById('try-again-btn');
const historyTable = document.getElementById('history-body');
const noHistoryMessage = document.getElementById('no-history-message');
const clearHistoryBtn = document.getElementById('clear-history-btn');

let timer;
let timeLeft;
let currentText = '';
let wordIndex = 0;
let correctWordCount = 0;
let incorrectWordCount = 0;
let startTime;
let isTestActive = false;
let testHistory = JSON.parse(localStorage.getItem('typingTestHistory')) || [];

const textSamples = {
    easy: [
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.",
        "She sells seashells by the seashore. The shells she sells are surely seashells.",
        "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        "Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked.",
        "I scream, you scream, we all scream for ice cream. It's a hot summer day."
    ],
    medium: [
        "The technology revolution has transformed how we communicate, work, and live our daily lives. Smartphones, social media, and instant messaging have made the world smaller.",
        "Climate change is one of the most pressing issues of our time. Rising temperatures, extreme weather events, and melting ice caps are all signs of a changing planet.",
        "Regular exercise and a balanced diet are essential components of a healthy lifestyle. Physical activity improves cardiovascular health and mental wellbeing.",
        "The global economy is increasingly interconnected. Events in one country can have ripple effects that impact markets and industries around the world.",
        "Artificial intelligence and machine learning are revolutionizing industries from healthcare to transportation. These technologies analyze vast amounts of data to make predictions."
    ],
    hard: [
        "The intricate complexities of quantum mechanics challenge our fundamental understanding of reality. Particles can exist in multiple states simultaneously until observed, a phenomenon known as quantum superposition.",
        "Neuroplasticity refers to the brain's remarkable ability to reorganize itself by forming new neural connections throughout life. This phenomenon allows neurons to compensate for injury and disease and to adjust their activities in response to new situations or changes.",
        "Photosynthesis is the process by which green plants and certain other organisms transform light energy into chemical energy. During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds.",
        "The implementation of cryptocurrency blockchain technology represents a paradigm shift in how we conceptualize digital transactions. Its decentralized nature eliminates the need for traditional intermediaries while providing unprecedented levels of security through cryptographic validation.",
        "Cognitive dissonance occurs when a person holds contradictory beliefs, ideas, or values, and is typically experienced as psychological stress when they participate in an action that goes against one or more of them. According to this theory, when two actions or ideas are not psychologically consistent with each other, people do all in their power to change them until they become consistent."
    ]
};

function updateHistory() {
    if (testHistory.length > 0) {
        noHistoryMessage.style.display = 'none';
        historyTable.innerHTML = '';
        
        testHistory.forEach(entry => {
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(entry.date).toLocaleDateString();
            
            const wpmCell = document.createElement('td');
            wpmCell.textContent = entry.wpm;
            
            const cpmCell = document.createElement('td');
            cpmCell.textContent = entry.cpm;
            
            const accuracyCell = document.createElement('td');
            accuracyCell.textContent = entry.accuracy + '%';
            
            const difficultyCell = document.createElement('td');
            difficultyCell.textContent = entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1);
            
            row.appendChild(dateCell);
            row.appendChild(wpmCell);
            row.appendChild(cpmCell);
            row.appendChild(accuracyCell);
            row.appendChild(difficultyCell);
            
            historyTable.appendChild(row);
        });
    } else {
        noHistoryMessage.style.display = 'block';
    }
}

function getRandomText() {
    const difficulty = difficultySelect.value;
    const samples = textSamples[difficulty];
    return samples[Math.floor(Math.random() * samples.length)];
}

function displayText(text) {
    textDisplay.innerHTML = '';
    currentText = text;
    
    const words = text.split(' ');
    words.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.textContent = word + (index < words.length - 1 ? ' ' : '');
        wordSpan.setAttribute('data-index', index);
        textDisplay.appendChild(wordSpan);
    });
    
    const firstWord = textDisplay.querySelector('span');
    if (firstWord) {
        firstWord.classList.add('current');
    }
}

function startTest() {
    if (isTestActive) return;
    
    const text = getRandomText();
    displayText(text);
    
    wordIndex = 0;
    correctWordCount = 0;
    incorrectWordCount = 0;
    
    textInput.value = '';
    textInput.disabled = false;
    textInput.focus();
    
    timeLeft = parseInt(timeSelect.value);
    timeDisplay.textContent = timeLeft;
    
    wpmDisplay.textContent = '0';
    cpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    
    startTime = new Date().getTime();
    isTestActive = true;
    
    timer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
    
    startBtn.disabled = true;
    difficultySelect.disabled = true;
    timeSelect.disabled = true;
}

function resetTest() {
    clearInterval(timer);
    isTestActive = false;
    
    textDisplay.innerHTML = '';
    textInput.value = '';
    textInput.disabled = true;
    
    timeLeft = parseInt(timeSelect.value);
    timeDisplay.textContent = timeLeft;
    
    wpmDisplay.textContent = '0';
    cpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    
    startBtn.disabled = false;
    difficultySelect.disabled = false;
    timeSelect.disabled = false;
}

function calculateResults() {
    const endTime = new Date().getTime();
    const timeElapsed = (endTime - startTime) / 1000;
    const totalWords = correctWordCount + incorrectWordCount;
    
    const minutes = timeElapsed / 60;
    const wpm = Math.round(correctWordCount / minutes);
    
    let totalChars = 0;
    const words = currentText.split(' ');
    for (let i = 0; i < wordIndex && i < words.length; i++) {
        totalChars += words[i].length + (i < words.length - 1 ? 1 : 0); // +1 for space
    }
    
    const cpm = Math.round(totalChars / minutes);
    
    let accuracy = 100;
    if (totalWords > 0) {
        accuracy = Math.round((correctWordCount / totalWords) * 100);
    }
    
    return {
        wpm,
        cpm,
        accuracy,
        correctWords: correctWordCount,
        incorrectWords: incorrectWordCount,
        timeTaken: Math.round(timeElapsed)
    };
}

function endTest() {
    clearInterval(timer);
    isTestActive = false;
    textInput.disabled = true;
    
    const results = calculateResults();
    
    resultWpm.textContent = results.wpm;
    resultCpm.textContent = results.cpm;
    resultAccuracy.textContent = results.accuracy + '%';
    correctWords.textContent = results.correctWords;
    incorrectWords.textContent = results.incorrectWords;
    timeTaken.textContent = results.timeTaken;
    
    resultModal.style.display = 'block';
    
    const historyEntry = {
        date: new Date().toISOString(),
        wpm: results.wpm,
        cpm: results.cpm,
        accuracy: results.accuracy,
        difficulty: difficultySelect.value,
        duration: parseInt(timeSelect.value)
    };
    
    testHistory.unshift(historyEntry);
    if (testHistory.length > 10) {
        testHistory.pop();
    }
    
    localStorage.setItem('typingTestHistory', JSON.stringify(testHistory));
    updateHistory();
    
    startBtn.disabled = false;
    difficultySelect.disabled = false;
    timeSelect.disabled = false;
}

function checkWord() {
    const words = currentText.split(' ');
    const typedWords = textInput.value.trim().split(/\s+/);
    const currentTypedWord = typedWords[typedWords.length - 1];
    
    const spans = textDisplay.querySelectorAll('span');
    
    for (let i = 0; i < typedWords.length - 1; i++) {
        if (i < wordIndex) continue;
        
        if (i < spans.length) {
            spans[i].classList.remove('current');
            
            if (typedWords[i] === words[i]) {
                spans[i].classList.add('correct');
                spans[i].classList.remove('incorrect');
                correctWordCount++;
            } else {
                spans[i].classList.add('incorrect');
                spans[i].classList.remove('correct');
                incorrectWordCount++;
            }
        }
        
        wordIndex++;
    }
    
    if (wordIndex < spans.length) {
        spans.forEach(span => span.classList.remove('current'));
        spans[wordIndex].classList.add('current');
    }
    
    updateStats();
}

function updateStats() {
    if (!isTestActive) return;
    
    const currentTime = new Date().getTime();
    const timeElapsed = (currentTime - startTime) / 1000;
    const minutes = timeElapsed / 60;
    
    if (minutes > 0) {
        const wpm = Math.round(correctWordCount / minutes);
        wpmDisplay.textContent = wpm;
        
        let totalChars = 0;
        const words = currentText.split(' ');
        for (let i = 0; i < wordIndex && i < words.length; i++) {
            totalChars += words[i].length + (i < words.length - 1 ? 1 : 0); // +1 for space
        }
        
        const cpm = Math.round(totalChars / minutes);
        cpmDisplay.textContent = cpm;
    }
    
    const totalWords = correctWordCount + incorrectWordCount;
    let accuracy = 100;
    if (totalWords > 0) {
        accuracy = Math.round((correctWordCount / totalWords) * 100);
    }
    accuracyDisplay.textContent = accuracy + '%';
}

startBtn.addEventListener('click', startTest);
resetBtn.addEventListener('click', resetTest);

textInput.addEventListener('input', () => {
    if (!isTestActive) return;
    
    const lastChar = textInput.value[textInput.value.length - 1];
    if (lastChar === ' ') {
        checkWord();
    }
});

textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && isTestActive) {
        e.preventDefault();
        textInput.value += ' ';
        checkWord();
    }
});

closeModal.addEventListener('click', () => {
    resultModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        resultModal.style.display = 'none';
    }
});

tryAgainBtn.addEventListener('click', () => {
    resultModal.style.display = 'none';
    resetTest();
    startTest();
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your typing history?')) {
        testHistory = [];
        localStorage.removeItem('typingTestHistory');
        updateHistory();
    }
});

timeSelect.addEventListener('change', () => {
    timeDisplay.textContent = timeSelect.value;
});

document.addEventListener('DOMContentLoaded', () => {
    textInput.disabled = true;
    updateHistory();
});
