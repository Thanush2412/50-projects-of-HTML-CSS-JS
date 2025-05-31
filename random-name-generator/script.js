// DOM Elements
const nameTypeSelect = document.getElementById('nameType');
const genderSelect = document.getElementById('gender');
const nameOriginSelect = document.getElementById('nameOrigin');
const quantityInput = document.getElementById('quantity');
const generateBtn = document.getElementById('generateBtn');
const namesList = document.getElementById('namesList');
const historyList = document.getElementById('historyList');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Name data - predefined lists
const firstNamesMale = {
    english: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'],
    spanish: ['Jose', 'Antonio', 'Manuel', 'Francisco', 'Juan', 'Miguel', 'Carlos', 'Javier', 'Rafael', 'Pedro'],
    french: ['Jean', 'Pierre', 'Louis', 'François', 'Michel', 'Philippe', 'Henri', 'André', 'Nicolas', 'Antoine'],
    german: ['Hans', 'Otto', 'Heinrich', 'Wilhelm', 'Friedrich', 'Walter', 'Kurt', 'Karl', 'Günter', 'Horst'],
    italian: ['Giuseppe', 'Antonio', 'Giovanni', 'Mario', 'Luigi', 'Roberto', 'Salvatore', 'Francesco', 'Angelo', 'Vincenzo'],
    japanese: ['Hiroshi', 'Takashi', 'Kazuo', 'Akira', 'Satoshi', 'Toshio', 'Kenji', 'Yasuo', 'Kiyoshi', 'Masao'],
    chinese: ['Wei', 'Jie', 'Min', 'Hao', 'Yi', 'Jun', 'Bin', 'Chao', 'Lei', 'Xiaolong'],
    indian: ['Raj', 'Amit', 'Vikram', 'Rahul', 'Sanjay', 'Sunil', 'Anil', 'Rajiv', 'Vijay', 'Suresh']
};

const firstNamesFemale = {
    english: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'],
    spanish: ['Maria', 'Ana', 'Carmen', 'Dolores', 'Isabel', 'Pilar', 'Teresa', 'Rosa', 'Lucia', 'Cristina'],
    french: ['Marie', 'Jeanne', 'Catherine', 'Anne', 'Françoise', 'Monique', 'Nicole', 'Isabelle', 'Sophie', 'Nathalie'],
    german: ['Anna', 'Ursula', 'Helga', 'Ingrid', 'Renate', 'Erika', 'Monika', 'Gisela', 'Christa', 'Brigitte'],
    italian: ['Maria', 'Anna', 'Giovanna', 'Rosa', 'Angela', 'Teresa', 'Lucia', 'Carmela', 'Giuseppina', 'Concetta'],
    japanese: ['Yoko', 'Keiko', 'Yumiko', 'Akiko', 'Kazuko', 'Yukiko', 'Tomoko', 'Sachiko', 'Junko', 'Masako'],
    chinese: ['Yan', 'Xiu', 'Fang', 'Li', 'Na', 'Mei', 'Ying', 'Hui', 'Jing', 'Min'],
    indian: ['Priya', 'Neha', 'Anjali', 'Pooja', 'Sunita', 'Anita', 'Rekha', 'Meena', 'Kavita', 'Shobha']
};

const lastNames = {
    english: ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'],
    spanish: ['Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres'],
    french: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau'],
    german: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann'],
    italian: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco'],
    japanese: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato'],
    chinese: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou'],
    indian: ['Sharma', 'Singh', 'Kumar', 'Patel', 'Rao', 'Verma', 'Gupta', 'Joshi', 'Agarwal', 'Mishra']
};

// Initialize history array
let nameHistory = JSON.parse(localStorage.getItem('nameHistory')) || [];

// Update history display
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    if (nameHistory.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'No history yet';
        emptyItem.style.fontStyle = 'italic';
        emptyItem.style.color = '#777';
        historyList.appendChild(emptyItem);
        return;
    }
    
    // Display most recent 10 names
    const recentHistory = nameHistory.slice(0, 10);
    
    recentHistory.forEach(name => {
        const historyItem = document.createElement('li');
        historyItem.textContent = name;
        historyList.appendChild(historyItem);
    });
}

// Generate random name
function generateRandomName() {
    const nameType = nameTypeSelect.value;
    const gender = genderSelect.value;
    const origin = nameOriginSelect.value;
    const quantity = parseInt(quantityInput.value) || 1;
    
    namesList.innerHTML = '';
    const generatedNames = [];
    
    for (let i = 0; i < quantity; i++) {
        let randomName = '';
        
        // Determine gender to use
        const actualGender = gender === 'any' ? (Math.random() > 0.5 ? 'male' : 'female') : gender;
        
        // Determine origin to use
        const origins = origin === 'any' ? Object.keys(lastNames) : [origin];
        const actualOrigin = origins[Math.floor(Math.random() * origins.length)];
        
        // Generate first name if needed
        if (nameType === 'first' || nameType === 'full') {
            const firstNameList = actualGender === 'male' ? firstNamesMale[actualOrigin] : firstNamesFemale[actualOrigin];
            const firstName = firstNameList[Math.floor(Math.random() * firstNameList.length)];
            randomName += firstName;
        }
        
        // Generate last name if needed
        if (nameType === 'last' || nameType === 'full') {
            const lastNameList = lastNames[actualOrigin];
            const lastName = lastNameList[Math.floor(Math.random() * lastNameList.length)];
            
            // Add space if we already have a first name
            if (randomName) {
                randomName += ' ';
            }
            
            randomName += lastName;
        }
        
        // Add to generated names
        generatedNames.push(randomName);
        
        // Create list item
        const nameItem = document.createElement('li');
        nameItem.textContent = randomName;
        namesList.appendChild(nameItem);
    }
    
    // Add to history
    nameHistory = [...generatedNames, ...nameHistory];
    
    // Limit history to 50 items
    if (nameHistory.length > 50) {
        nameHistory = nameHistory.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('nameHistory', JSON.stringify(nameHistory));
    
    // Update history display
    updateHistoryDisplay();
}

// Copy names to clipboard
function copyNames() {
    if (namesList.children.length === 0) {
        alert('No names to copy!');
        return;
    }
    
    const names = [];
    for (const child of namesList.children) {
        names.push(child.textContent);
    }
    
    const textToCopy = names.join('\n');
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert('Names copied to clipboard!');
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy names. Please try again.');
        });
}

// Clear results
function clearResults() {
    namesList.innerHTML = '';
}

// Clear history
function clearHistory() {
    nameHistory = [];
    localStorage.removeItem('nameHistory');
    updateHistoryDisplay();
}

// Event listeners
generateBtn.addEventListener('click', generateRandomName);
copyBtn.addEventListener('click', copyNames);
clearBtn.addEventListener('click', clearResults);
clearHistoryBtn.addEventListener('click', clearHistory);

// Initialize history display on page load
updateHistoryDisplay();
