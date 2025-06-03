// DOM Elements
const keyboard = document.getElementById('keyboard');
const inputText = document.getElementById('input-text');
const layoutSelect = document.getElementById('keyboard-layout');
const themeSelect = document.getElementById('keyboard-theme');
const soundToggle = document.getElementById('sound-toggle');

// Keyboard State
let state = {
    capsLock: false,
    shift: false,
    currentLayout: 'standard',
    currentTheme: 'light',
    soundEnabled: true
};

// Key Sound
const keySound = new Audio();
keySound.src = 'sounds/key-press.mp3';

// Keyboard Layouts
const layouts = {
    standard: {
        rows: [
            ['`~', '1!', '2@', '3#', '4$', '5%', '6^', '7&', '8*', '9(', '0)', '-_', '=+', 'Backspace'],
            ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[{', ']}', '\\|'],
            ['Caps Lock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';:', '\'"', 'Enter'],
            ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',<', '.>', '/?', 'Shift'],
            ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctrl']
        ]
    },
    dvorak: {
        rows: [
            ['`~', '1!', '2@', '3#', '4$', '5%', '6^', '7&', '8*', '9(', '0)', '[{', ']}', 'Backspace'],
            ['Tab', '\'"', ',<', '.>', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/?', '=+', '\\|'],
            ['Caps Lock', 'a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-_', 'Enter'],
            ['Shift', ';:', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z', 'Shift'],
            ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctrl']
        ]
    }
};

// Initialize Keyboard
function initKeyboard() {
    renderKeyboard();
    addEventListeners();
    updateTheme();
}

// Render the keyboard based on the current layout
function renderKeyboard() {
    keyboard.innerHTML = '';
    const currentLayout = layouts[state.currentLayout];
    
    currentLayout.rows.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyElement = createKey(key);
            keyboardRow.appendChild(keyElement);
        });
        
        keyboard.appendChild(keyboardRow);
    });
}

// Create a key element
function createKey(key) {
    const keyElement = document.createElement('div');
    keyElement.className = 'key';
    keyElement.dataset.key = key;
    
    // Handle special keys
    if (key === 'Space') {
        keyElement.className += ' space';
        keyElement.innerHTML = '';
    } else if (key === 'Backspace' || key === 'Tab' || key === 'Enter' || key === 'Caps Lock') {
        keyElement.className += ' wide special';
        keyElement.textContent = key;
    } else if (key === 'Shift') {
        keyElement.className += ' extra-wide special';
        keyElement.textContent = key;
    } else if (key === 'Ctrl' || key === 'Alt' || key === 'Win' || key === 'Fn') {
        keyElement.className += ' special';
        keyElement.textContent = key;
    } else if (key.length > 1) {
        // Keys with multiple characters (regular + shifted)
        const regular = key[0];
        const shifted = key[1];
        
        keyElement.textContent = regular;
        
        if (shifted) {
            const shiftedElement = document.createElement('span');
            shiftedElement.className = 'shifted';
            shiftedElement.textContent = shifted;
            keyElement.appendChild(shiftedElement);
        }
    } else {
        keyElement.textContent = key;
    }
    
    return keyElement;
}

// Add event listeners
function addEventListeners() {
    // Virtual keyboard click events
    keyboard.addEventListener('mousedown', handleKeyClick);
    
    // Physical keyboard events
    document.addEventListener('keydown', handlePhysicalKeyDown);
    document.addEventListener('keyup', handlePhysicalKeyUp);
    
    // Settings changes
    layoutSelect.addEventListener('change', handleLayoutChange);
    themeSelect.addEventListener('change', handleThemeChange);
    soundToggle.addEventListener('change', handleSoundToggle);
    
    // Focus the input when clicking on the keyboard
    keyboard.addEventListener('mousedown', () => {
        inputText.focus();
    });
}

// Handle virtual key clicks
function handleKeyClick(e) {
    if (e.target.classList.contains('key')) {
        const key = e.target.dataset.key;
        processKey(key);
        
        // Add pressed animation
        e.target.classList.add('pressed');
        setTimeout(() => {
            e.target.classList.remove('pressed');
        }, 100);
    }
}

// Handle physical keyboard key down
function handlePhysicalKeyDown(e) {
    // Find the corresponding virtual key
    let keyElement;
    
    if (e.key === ' ') {
        keyElement = document.querySelector('.key.space');
    } else if (e.key === 'Backspace') {
        keyElement = document.querySelector('.key[data-key="Backspace"]');
    } else if (e.key === 'Tab') {
        e.preventDefault(); // Prevent tab from changing focus
        keyElement = document.querySelector('.key[data-key="Tab"]');
    } else if (e.key === 'Enter') {
        keyElement = document.querySelector('.key[data-key="Enter"]');
    } else if (e.key === 'CapsLock') {
        keyElement = document.querySelector('.key[data-key="Caps Lock"]');
    } else if (e.key === 'Shift') {
        keyElement = document.querySelector('.key[data-key="Shift"]');
        state.shift = true;
        updateKeyDisplay();
    } else if (e.key === 'Control') {
        keyElement = document.querySelector('.key[data-key="Ctrl"]');
    } else if (e.key === 'Alt') {
        keyElement = document.querySelector('.key[data-key="Alt"]');
    } else if (e.key === 'Meta') {
        keyElement = document.querySelector('.key[data-key="Win"]');
    } else {
        // Try to find the key by its lowercase value
        const lowerKey = e.key.toLowerCase();
        keyElement = document.querySelector(`.key[data-key="${lowerKey}"]`);
        
        // If not found, try to find it in the keys with multiple characters
        if (!keyElement) {
            const keys = document.querySelectorAll('.key');
            for (const key of keys) {
                if (key.textContent.toLowerCase() === lowerKey) {
                    keyElement = key;
                    break;
                }
            }
        }
    }
    
    if (keyElement) {
        keyElement.classList.add('active');
        
        // Play sound if enabled
        if (state.soundEnabled) {
            playKeySound();
        }
    }
}

// Handle physical keyboard key up
function handlePhysicalKeyUp(e) {
    if (e.key === 'Shift') {
        state.shift = false;
        updateKeyDisplay();
    }
    
    // Remove active class from all keys
    document.querySelectorAll('.key.active').forEach(key => {
        key.classList.remove('active');
    });
}

// Process key press
function processKey(key) {
    // Play sound if enabled
    if (state.soundEnabled) {
        playKeySound();
    }
    
    switch(key) {
        case 'Backspace':
            handleBackspace();
            break;
        case 'Tab':
            handleTab();
            break;
        case 'Caps Lock':
            handleCapsLock();
            break;
        case 'Enter':
            handleEnter();
            break;
        case 'Shift':
            handleShift();
            break;
        case 'Space':
            handleSpace();
            break;
        case 'Ctrl':
        case 'Alt':
        case 'Win':
        case 'Fn':
            // These keys don't do anything in our virtual keyboard
            break;
        default:
            handleRegularKey(key);
            break;
    }
}

// Handle regular key press
function handleRegularKey(key) {
    // For keys with multiple characters
    if (key.length > 1) {
        const regular = key[0];
        const shifted = key[1];
        
        if (state.shift) {
            insertText(shifted);
        } else {
            insertText(state.capsLock ? regular.toUpperCase() : regular);
        }
    } else {
        insertText(state.capsLock || state.shift ? key.toUpperCase() : key);
    }
    
    // Turn off shift after a key press
    if (state.shift) {
        state.shift = false;
        updateKeyDisplay();
    }
}

// Insert text at cursor position
function insertText(text) {
    const start = inputText.selectionStart;
    const end = inputText.selectionEnd;
    const currentValue = inputText.value;
    
    inputText.value = currentValue.substring(0, start) + text + currentValue.substring(end);
    
    // Move cursor position
    inputText.selectionStart = inputText.selectionEnd = start + text.length;
    inputText.focus();
}

// Handle backspace key
function handleBackspace() {
    const start = inputText.selectionStart;
    const end = inputText.selectionEnd;
    const currentValue = inputText.value;
    
    if (start === end) {
        // No selection, delete character before cursor
        if (start > 0) {
            inputText.value = currentValue.substring(0, start - 1) + currentValue.substring(end);
            inputText.selectionStart = inputText.selectionEnd = start - 1;
        }
    } else {
        // Delete selected text
        inputText.value = currentValue.substring(0, start) + currentValue.substring(end);
        inputText.selectionStart = inputText.selectionEnd = start;
    }
    
    inputText.focus();
}

// Handle tab key
function handleTab() {
    insertText('\t');
}

// Handle caps lock key
function handleCapsLock() {
    state.capsLock = !state.capsLock;
    
    // Update the Caps Lock key visual state
    const capsLockKey = document.querySelector('.key[data-key="Caps Lock"]');
    if (state.capsLock) {
        capsLockKey.classList.add('active');
    } else {
        capsLockKey.classList.remove('active');
    }
}

// Handle enter key
function handleEnter() {
    insertText('\n');
}

// Handle shift key
function handleShift() {
    state.shift = !state.shift;
    updateKeyDisplay();
}

// Handle space key
function handleSpace() {
    insertText(' ');
}

// Update key display based on shift state
function updateKeyDisplay() {
    const keys = document.querySelectorAll('.key');
    const shiftKeys = document.querySelectorAll('.key[data-key="Shift"]');
    
    if (state.shift) {
        shiftKeys.forEach(key => key.classList.add('active'));
    } else {
        shiftKeys.forEach(key => key.classList.remove('active'));
    }
}

// Play key sound
function playKeySound() {
    keySound.currentTime = 0;
    keySound.play().catch(error => {
        // Handle or ignore error (browsers may block autoplay)
    });
}

// Handle layout change
function handleLayoutChange(e) {
    state.currentLayout = e.target.value;
    renderKeyboard();
}

// Handle theme change
function handleThemeChange(e) {
    state.currentTheme = e.target.value;
    updateTheme();
}

// Update keyboard theme
function updateTheme() {
    keyboard.className = 'keyboard ' + state.currentTheme;
}

// Handle sound toggle
function handleSoundToggle(e) {
    state.soundEnabled = e.target.checked;
}

// Initialize keyboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initKeyboard);
