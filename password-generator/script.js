const resultEl = document.getElementById('result');
const lengthEl = document.getElementById('length');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');
const generateEl = document.getElementById('generate');
const clipboardEl = document.getElementById('clipboard');
const strengthIndicatorEl = document.getElementById('strength-indicator');
const historyListEl = document.getElementById('history-list');
const clearHistoryEl = document.getElementById('clear-history');

const randomFunc = {
    lower: getRandomLower,
    upper: getRandomUpper,
    number: getRandomNumber,
    symbol: getRandomSymbol
};

let passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];

function getRandomLower() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}

function getRandomUpper() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}

function getRandomNumber() {
    return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}

function getRandomSymbol() {
    const symbols = '!@#$%^&*(){}[]=<>/,.';
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function calculateStrength(password) {
    let strength = 0;
    
    if (password.length >= 12) {
        strength += 1;
    }
    
    if (/[A-Z]/.test(password)) {
        strength += 1;
    }
    
    if (/[a-z]/.test(password)) {
        strength += 1;
    }
    
    if (/[0-9]/.test(password)) {
        strength += 1;
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
        strength += 1;
    }
    
    strengthIndicatorEl.className = 'strength-indicator';
    
    if (strength <= 2) {
        strengthIndicatorEl.classList.add('weak');
        return 'weak';
    } else if (strength <= 4) {
        strengthIndicatorEl.classList.add('medium');
        return 'medium';
    } else {
        strengthIndicatorEl.classList.add('strong');
        return 'strong';
    }
}

function generatePassword() {
    const length = +lengthEl.value;
    const hasLower = lowercaseEl.checked;
    const hasUpper = uppercaseEl.checked;
    const hasNumber = numbersEl.checked;
    const hasSymbol = symbolsEl.checked;
    
    if (!hasLower && !hasUpper && !hasNumber && !hasSymbol) {
        showAlert('Please select at least one option', 'error');
        return '';
    }
    
    const typesCount = hasLower + hasUpper + hasNumber + hasSymbol;
    const typesArr = [
        { type: 'lower', active: hasLower },
        { type: 'upper', active: hasUpper },
        { type: 'number', active: hasNumber },
        { type: 'symbol', active: hasSymbol }
    ].filter(item => item.active);
    
    let generatedPassword = '';
    
    for (let i = 0; i < length; i++) {
        const typeIndex = Math.floor(Math.random() * typesArr.length);
        const type = typesArr[typeIndex].type;
        generatedPassword += randomFunc[type]();
    }
    
    return generatedPassword;
}

function updateUI() {
    historyListEl.innerHTML = '';
    
    passwordHistory.slice(0, 5).forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.password}</span>
            <div>
                <button class="use-btn" data-index="${index}">Use</button>
                <button class="delete-btn" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        historyListEl.appendChild(li);
    });
    
    const useButtons = document.querySelectorAll('.use-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    useButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = button.getAttribute('data-index');
            resultEl.innerText = passwordHistory[index].password;
            calculateStrength(passwordHistory[index].password);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = button.getAttribute('data-index');
            passwordHistory.splice(index, 1);
            localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
            updateUI();
        });
    });
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.innerText = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

generateEl.addEventListener('click', () => {
    const password = generatePassword();
    
    if (password) {
        resultEl.innerText = password;
        const strength = calculateStrength(password);
        
        const timestamp = new Date().toLocaleString();
        passwordHistory.unshift({ password, timestamp, strength });
        
        if (passwordHistory.length > 10) {
            passwordHistory.pop();
        }
        
        localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
        updateUI();
    }
});

clipboardEl.addEventListener('click', () => {
    const password = resultEl.innerText;
    
    if (!password) {
        showAlert('Nothing to copy', 'error');
        return;
    }
    
    navigator.clipboard.writeText(password)
        .then(() => {
            showAlert('Password copied to clipboard');
        })
        .catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = password;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
            showAlert('Password copied to clipboard');
        });
});

clearHistoryEl.addEventListener('click', () => {
    passwordHistory = [];
    localStorage.removeItem('passwordHistory');
    updateUI();
    showAlert('History cleared');
});

lengthEl.addEventListener('input', () => {
    if (lengthEl.value < 4) {
        lengthEl.value = 4;
    } else if (lengthEl.value > 20) {
        lengthEl.value = 20;
    }
});

updateUI();

if (resultEl.innerText === '') {
    generateEl.click();
}
