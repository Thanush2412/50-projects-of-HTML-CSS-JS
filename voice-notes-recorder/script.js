const recordBtn = document.getElementById('record-btn');
const recordingStatus = document.getElementById('recording-status');
const timer = document.getElementById('timer');
const visualizer = document.getElementById('visualizer');
const notesList = document.getElementById('notes-list');

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let startTime;
let timerInterval;
let audioContext;
let analyser;
let visualizerCanvas;
let canvasContext;
let savedNotes = [];

function init() {
    loadSavedNotes();
    setupVisualizer();
    recordBtn.addEventListener('click', toggleRecording);
    
    if (!navigator.mediaDevices || !window.MediaRecorder) {
        alert('Your browser does not support audio recording. Please try Chrome, Firefox, or Edge.');
        recordBtn.disabled = true;
    }
}

function setupVisualizer() {
    visualizerCanvas = visualizer;
    canvasContext = visualizerCanvas.getContext('2d');
    visualizerCanvas.width = visualizerCanvas.offsetWidth;
    visualizerCanvas.height = visualizerCanvas.offsetHeight;
    canvasContext.fillStyle = '#f0f0f7';
    canvasContext.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
}

async function toggleRecording() {
    isRecording ? stopRecording() : startRecording();
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        audioContext.createMediaStreamSource(stream).connect(analyser);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        function drawVisualizer() {
            if (!isRecording) return;
            requestAnimationFrame(drawVisualizer);
            
            analyser.getByteFrequencyData(dataArray);
            canvasContext.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
            canvasContext.fillStyle = '#ffffff';
            canvasContext.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
            
            const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * visualizerCanvas.height;
                canvasContext.fillStyle = `hsl(${i / bufferLength * 360}, 70%, 60%)`;
                canvasContext.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        }
        
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            saveRecording(audioBlob);
            audioChunks = [];
            stream.getTracks().forEach(track => track.stop());
            if (audioContext) audioContext.close();
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        recordBtn.classList.add('recording');
        recordBtn.querySelector('.btn-text').textContent = 'Stop';
        recordingStatus.querySelector('.status-text').textContent = 'Recording...';
        
        startTime = Date.now();
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
        
        drawVisualizer();
        
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Could not access microphone. Please ensure you have a microphone connected and you have granted permission to use it.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        recordBtn.classList.remove('recording');
        recordBtn.querySelector('.btn-text').textContent = 'Record';
        recordingStatus.querySelector('.status-text').textContent = 'Recording saved';
        clearInterval(timerInterval);
    }
}

function updateTimer() {
    const elapsedTime = Date.now() - startTime;
    const seconds = Math.floor((elapsedTime / 1000) % 60);
    const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function saveRecording(audioBlob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const newNote = {
        id: Date.now(),
        title: `Voice Note ${savedNotes.length + 1}`,
        date: new Date().toISOString(),
        audioUrl: audioUrl,
        audioBlob: audioBlob
    };
    
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = function() {
        newNote.audioData = reader.result;
        savedNotes.unshift(newNote);
        
        localStorage.setItem('voiceNotes', JSON.stringify(savedNotes.map(note => {
            const { audioBlob, audioUrl, ...noteData } = note;
            return noteData;
        })));
        
        updateNotesList();
    };
}

function loadSavedNotes() {
    const savedData = localStorage.getItem('voiceNotes');
    
    if (savedData) {
        savedNotes = JSON.parse(savedData).map(note => {
            if (note.audioData) {
                const byteString = atob(note.audioData.split(',')[1]);
                const mimeString = note.audioData.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                
                const blob = new Blob([ab], { type: mimeString });
                return {
                    ...note,
                    audioBlob: blob,
                    audioUrl: URL.createObjectURL(blob)
                };
            }
            return note;
        });
        updateNotesList();
    }
}

function updateNotesList() {
    notesList.innerHTML = '';
    
    if (savedNotes.length === 0) {
        notesList.innerHTML = '<p class="empty-notes">No voice notes yet. Start recording!</p>';
        return;
    }
    
    savedNotes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        
        const date = new Date(note.date);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        noteItem.innerHTML = `
            <div class="note-header">
                <div class="note-title">${note.title}</div>
                <div class="note-date">${formattedDate}</div>
            </div>
            <div class="note-controls">
                <button class="play-btn">Play</button>
                <button class="delete-btn">Delete</button>
            </div>
            <audio class="audio-player" controls src="${note.audioUrl}"></audio>
        `;
        
        noteItem.querySelector('.play-btn').addEventListener('click', () => {
            const audio = noteItem.querySelector('.audio-player');
            audio.paused ? audio.play() : audio.pause();
        });
        
        noteItem.querySelector('.delete-btn').addEventListener('click', () => {
            deleteNote(note.id);
        });
        
        notesList.appendChild(noteItem);
    });
}

function deleteNote(id) {
    savedNotes = savedNotes.filter(note => note.id !== id);
    
    localStorage.setItem('voiceNotes', JSON.stringify(savedNotes.map(note => {
        const { audioBlob, audioUrl, ...noteData } = note;
        return noteData;
    })));
    
    updateNotesList();
}

document.addEventListener('DOMContentLoaded', init);
