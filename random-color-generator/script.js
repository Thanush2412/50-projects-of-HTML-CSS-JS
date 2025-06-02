const colorBox = document.getElementById('color-box');
const colorValue = document.getElementById('color-value');
const copyBtn = document.getElementById('copy-btn');
const generateBtn = document.getElementById('generate-btn');
const historyList = document.getElementById('history-list');
const formatOptions = document.querySelectorAll('input[name="color-format"]');

let currentColor = {};
let colorHistory = [];
let selectedFormat = 'hex';

function init() {
    loadColorHistory();
    generateBtn.addEventListener('click', generateRandomColor);
    copyBtn.addEventListener('click', copyColorToClipboard);
    formatOptions.forEach(option => {
        option.addEventListener('change', () => {
            selectedFormat = option.value;
            updateColorDisplay();
        });
    });
    generateRandomColor();
}

function generateRandomColor() {
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    
    currentColor = {
        red, green, blue,
        hex: rgbToHex(red, green, blue),
        rgb: `rgb(${red}, ${green}, ${blue})`,
        hsl: rgbToHsl(red, green, blue)
    };
    
    addToHistory(currentColor);
    updateColorDisplay();
}

function updateColorDisplay() {
    colorBox.style.backgroundColor = currentColor.rgb;
    colorValue.textContent = currentColor[selectedFormat];
}

function rgbToHex(r, g, b) {
    const toHex = c => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function copyColorToClipboard() {
    navigator.clipboard.writeText(colorValue.textContent)
        .then(() => {
            let message = document.querySelector('.copied-message');
            
            if (!message) {
                message = document.createElement('div');
                message.className = 'copied-message';
                message.textContent = 'Color copied to clipboard!';
                document.body.appendChild(message);
            }
            
            message.classList.add('show');
            setTimeout(() => message.classList.remove('show'), 2000);
        })
        .catch(err => console.error('Could not copy text: ', err));
}

function addToHistory(color) {
    colorHistory.unshift(color);
    if (colorHistory.length > 20) colorHistory.pop();
    localStorage.setItem('colorHistory', JSON.stringify(colorHistory));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    colorHistory.forEach(color => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.style.backgroundColor = color.rgb;
        historyItem.title = color.hex;
        historyItem.addEventListener('click', () => {
            currentColor = color;
            updateColorDisplay();
        });
        
        historyList.appendChild(historyItem);
    });
}

function loadColorHistory() {
    const savedHistory = localStorage.getItem('colorHistory');
    if (savedHistory) {
        colorHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

document.addEventListener('DOMContentLoaded', init);
