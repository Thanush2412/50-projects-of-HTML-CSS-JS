// DOM Elements
const voiceSelect = document.getElementById('voice-select');
const rate = document.getElementById('rate');
const rateValue = document.getElementById('rate-value');
const pitch = document.getElementById('pitch');
const pitchValue = document.getElementById('pitch-value');
const textToRead = document.getElementById('text-to-read');
const speakBtn = document.getElementById('speak-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const stopBtn = document.getElementById('stop-btn');
const phraseBtns = document.querySelectorAll('.phrase-btn');
const saveTextBtn = document.getElementById('save-text');
const saveName = document.getElementById('save-name');
const savedList = document.getElementById('saved-list');
const clearSavedBtn = document.getElementById('clear-saved');

let synth = window.speechSynthesis;
let voices = [];
let savedTexts = [];

function initialize() {
    if (!('speechSynthesis' in window)) {
        document.querySelector('.card').innerHTML = '<p>Text-to-speech is not supported in this browser.</p>';
        return;
    }
    
    loadVoices();
    
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
    }
    
    speakBtn.addEventListener('click', speak);
    pauseBtn.addEventListener('click', pauseSpeech);
    resumeBtn.addEventListener('click', resumeSpeech);
    stopBtn.addEventListener('click', stopSpeech);
    
    rate.addEventListener('input', () => {
        rateValue.textContent = rate.value;
    });
    
    pitch.addEventListener('input', () => {
        pitchValue.textContent = pitch.value;
    });
    
    phraseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            textToRead.value = btn.textContent;
        });
    });
    
    saveTextBtn.addEventListener('click', saveText);
    clearSavedBtn.addEventListener('click', clearSavedTexts);
    
    loadSavedTexts();
}

function saveText() {
    const text = textToRead.value.trim();
    const name = saveName.value.trim() || 'Unnamed Text';
    
    if (!text) return;
    
    const newText = {
        id: Date.now(),
        name: name,
        text: text,
        date: new Date().toISOString()
    };
    
    savedTexts.unshift(newText);
    localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
    updateSavedList();
    
    saveName.value = '';
}

function loadSavedTexts() {
    const saved = localStorage.getItem('savedTexts');
    if (saved) {
        savedTexts = JSON.parse(saved);
        updateSavedList();
    }
}

function updateSavedList() {
    savedList.innerHTML = '';
    
    if (savedTexts.length === 0) {
        savedList.innerHTML = '<li class="saved-item empty-list">No saved texts yet</li>';
        return;
    }
    
    savedTexts.forEach(item => {
        const li = document.createElement('li');
        li.className = 'saved-item';
        const date = new Date(item.date);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        li.innerHTML = `
            <div class="saved-info">
                <div class="saved-name">${item.name}</div>
                <div class="saved-date">${formattedDate}</div>
            </div>
            <div class="saved-actions">
                <button class="load-btn">Load</button>
                <button class="speak-btn">Speak</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        li.querySelector('.load-btn').addEventListener('click', () => {
            textToRead.value = item.text;
        });
        
        li.querySelector('.speak-btn').addEventListener('click', () => {
            textToRead.value = item.text;
            speak();
        });
        
        li.querySelector('.delete-btn').addEventListener('click', () => {
            savedTexts = savedTexts.filter(t => t.id !== item.id);
            localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
            updateSavedList();
        });
        
        savedList.appendChild(li);
    });
}

function clearSavedTexts() {
    savedTexts = [];
    localStorage.removeItem('savedTexts');
    updateSavedList();
}

function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';
    
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.setAttribute('data-name', voice.name);
        voiceSelect.appendChild(option);
    });
    
    const englishVoice = voices.findIndex(voice => voice.lang.includes('en-'));
    if (englishVoice !== -1) {
        voiceSelect.selectedIndex = englishVoice;
    }
}

function speak() {
    if (synth.speaking) {
        stopSpeech();
    }
    
    const text = textToRead.value;
    if (!text) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const selectedVoice = voiceSelect.selectedOptions[0].getAttribute('data-name');
    utterance.voice = voices.find(voice => voice.name === selectedVoice);
    
    utterance.rate = parseFloat(rate.value);
    utterance.pitch = parseFloat(pitch.value);
    
    utterance.onstart = () => {
        speakBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
    };
    
    utterance.onend = () => {
        resetSpeechButtons();
    };
    
    synth.speak(utterance);
}

function pauseSpeech() {
    synth.pause();
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
}

function resumeSpeech() {
    synth.resume();
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
}

function stopSpeech() {
    synth.cancel();
    resetSpeechButtons();
}

function resetSpeechButtons() {
    speakBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    stopBtn.disabled = true;
}

document.addEventListener('DOMContentLoaded', initialize);
