const homeSection = document.getElementById('home');
const quizSection = document.getElementById('quiz');
const endSection = document.getElementById('end');
const highscoresSection = document.getElementById('highscores');

const startBtn = document.getElementById('start-btn');
const highscoresBtn = document.getElementById('highscores-btn');
const questionCounter = document.getElementById('question-counter');
const scoreText = document.getElementById('score');
const questionElement = document.getElementById('question');
const choiceElements = document.querySelectorAll('.choice-text');
const finalScoreElement = document.getElementById('final-score');
const usernameInput = document.getElementById('username');
const saveScoreBtn = document.getElementById('save-score-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const goHomeBtn = document.getElementById('go-home-btn');
const highscoresList = document.getElementById('highscores-list');
const returnHomeBtn = document.getElementById('return-home-btn');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionIndex = 0;
let availableQuestions = [];

const questions = [
    {
        question: "What does HTML stand for?",
        choice1: "Hyper Text Markup Language",
        choice2: "High Tech Multi Language",
        choice3: "Hyper Transfer Markup Language",
        choice4: "Home Tool Markup Language",
        answer: 1
    },
    {
        question: "Which property is used to change the background color in CSS?",
        choice1: "color",
        choice2: "bgcolor",
        choice3: "background-color",
        choice4: "background",
        answer: 3
    },
    {
        question: "Which symbol is used to select an id in CSS?",
        choice1: ".",
        choice2: "#",
        choice3: "$",
        choice4: "@",
        answer: 2
    },
    {
        question: "Which of the following is not a JavaScript data type?",
        choice1: "String",
        choice2: "Boolean",
        choice3: "Float",
        choice4: "Object",
        answer: 3
    },
    {
        question: "What is the correct way to write a JavaScript array?",
        choice1: "var colors = (1:'red', 2:'green', 3:'blue')",
        choice2: "var colors = ['red', 'green', 'blue']",
        choice3: "var colors = 'red', 'green', 'blue'",
        choice4: "var colors = {red, green, blue}",
        answer: 2
    },
    {
        question: "Which event occurs when a user clicks on an HTML element?",
        choice1: "onmouseover",
        choice2: "onchange",
        choice3: "onclick",
        choice4: "onmouseclick",
        answer: 3
    },
    {
        question: "What does CSS stand for?",
        choice1: "Creative Style Sheets",
        choice2: "Computer Style Sheets",
        choice3: "Cascading Style Sheets",
        choice4: "Colorful Style Sheets",
        answer: 3
    },
    {
        question: "Which method adds a new element at the end of an array?",
        choice1: "push()",
        choice2: "pop()",
        choice3: "append()",
        choice4: "add()",
        answer: 1
    },
    {
        question: "Which operator is used to assign a value to a variable?",
        choice1: "*",
        choice2: "=",
        choice3: "x",
        choice4: "-",
        answer: 2
    },
    {
        question: "How do you create a function in JavaScript?",
        choice1: "function = myFunction()",
        choice2: "function:myFunction()",
        choice3: "function myFunction()",
        choice4: "create myFunction()",
        answer: 3
    }
];

const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 10;

function startQuiz() {
    questionIndex = 0;
    score = 0;
    availableQuestions = [...questions];
    
    homeSection.classList.add('hide');
    quizSection.classList.remove('hide');
    
    getNewQuestion();
}

function getNewQuestion() {
    if (availableQuestions.length === 0 || questionIndex >= MAX_QUESTIONS) {
        endQuiz();
        return;
    }
    
    questionIndex++;
    questionCounter.innerText = `${questionIndex}/${MAX_QUESTIONS}`;
    
    const questionNo = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionNo];
    questionElement.innerText = currentQuestion.question;
    
    choiceElements.forEach(choice => {
        const number = choice.dataset.number;
        choice.innerText = currentQuestion['choice' + number];
    });
    
    availableQuestions.splice(questionNo, 1);
    acceptingAnswers = true;
}

function checkAnswer(selectedChoice) {
    if (!acceptingAnswers) return;
    
    acceptingAnswers = false;
    const selectedAnswer = parseInt(selectedChoice.dataset.number);
    const classToApply = selectedAnswer === currentQuestion.answer ? 'correct' : 'incorrect';
    
    if (classToApply === 'correct') {
        incrementScore(CORRECT_BONUS);
    }
    
    selectedChoice.parentElement.classList.add(classToApply);
    
    setTimeout(() => {
        selectedChoice.parentElement.classList.remove(classToApply);
        getNewQuestion();
    }, 1000);
}

function incrementScore(num) {
    score += num;
    scoreText.innerText = score;
}

function endQuiz() {
    quizSection.classList.add('hide');
    endSection.classList.remove('hide');
    finalScoreElement.innerText = score;
}

function saveHighScore(e) {
    e.preventDefault();
    
    const username = usernameInput.value;
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    
    const newScore = {
        score: score,
        name: username
    };
    
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(5);
    
    localStorage.setItem('highScores', JSON.stringify(highScores));
    
    showHighScores();
}

function showHighScores() {
    homeSection.classList.add('hide');
    quizSection.classList.add('hide');
    endSection.classList.add('hide');
    highscoresSection.classList.remove('hide');
    
    highscoresList.innerHTML = '';
    
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    
    highScores.forEach(score => {
        const li = document.createElement('li');
        li.className = 'high-score';
        li.innerHTML = `<span>${score.name}</span><span>${score.score}</span>`;
        highscoresList.appendChild(li);
    });
}

function goHome() {
    homeSection.classList.remove('hide');
    quizSection.classList.add('hide');
    endSection.classList.add('hide');
    highscoresSection.classList.add('hide');
}

startBtn.addEventListener('click', startQuiz);
highscoresBtn.addEventListener('click', showHighScores);

choiceElements.forEach(choice => {
    choice.addEventListener('click', () => checkAnswer(choice));
});

usernameInput.addEventListener('keyup', () => {
    saveScoreBtn.disabled = !usernameInput.value;
});

saveScoreBtn.addEventListener('click', saveHighScore);
playAgainBtn.addEventListener('click', startQuiz);
goHomeBtn.addEventListener('click', goHome);
returnHomeBtn.addEventListener('click', goHome);
