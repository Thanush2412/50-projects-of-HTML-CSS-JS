const currencyFromEl = document.getElementById('currency-from');
const currencyToEl = document.getElementById('currency-to');
const amountFromEl = document.getElementById('amount-from');
const amountToEl = document.getElementById('amount-to');
const rateEl = document.getElementById('rate');
const swapBtn = document.getElementById('swap');
const convertBtn = document.getElementById('convert');
const historyListEl = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

const API_URL = 'https://open.er-api.com/v6/latest/';

let exchangeRates = {};
let conversionHistory = [];

function initialize() {
    loadCurrencies();
    loadHistory();
    setupEventListeners();
}

async function loadCurrencies() {
    try {
        const response = await fetch(`${API_URL}USD`);
        const data = await response.json();
        
        if (data.result === 'success' || data.rates) {
            exchangeRates = data.rates || data.conversion_rates;
            
            const currencies = Object.keys(exchangeRates);
            
            // Populate currency dropdowns
            currencies.forEach(currency => {
                const optionFrom = document.createElement('option');
                optionFrom.value = currency;
                optionFrom.text = currency;
                if (currency === 'USD') optionFrom.selected = true;
                currencyFromEl.appendChild(optionFrom);
                
                const optionTo = document.createElement('option');
                optionTo.value = currency;
                optionTo.text = currency;
                if (currency === 'EUR') optionTo.selected = true;
                currencyToEl.appendChild(optionTo);
            });
            
            // Initial calculation
            calculate();
        } else {
            showError('Failed to load currencies. Please try again later.');
        }
    } catch (error) {
        showError('Network error. Please check your connection.');
        
        // Fallback to common currencies if API fails
        const commonCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'RUB'];
        
        commonCurrencies.forEach(currency => {
            const optionFrom = document.createElement('option');
            optionFrom.value = currency;
            optionFrom.text = currency;
            if (currency === 'USD') optionFrom.selected = true;
            currencyFromEl.appendChild(optionFrom);
            
            const optionTo = document.createElement('option');
            optionTo.value = currency;
            optionTo.text = currency;
            if (currency === 'EUR') optionTo.selected = true;
            currencyToEl.appendChild(optionTo);
        });
    }
}

function setupEventListeners() {
    convertBtn.addEventListener('click', () => {
        calculate();
        addToHistory();
    });
    
    swapBtn.addEventListener('click', () => {
        const temp = currencyFromEl.value;
        currencyFromEl.value = currencyToEl.value;
        currencyToEl.value = temp;
        calculate();
    });
    
    clearHistoryBtn.addEventListener('click', clearHistory);
}

async function calculate() {
    const fromCurrency = currencyFromEl.value;
    const toCurrency = currencyToEl.value;
    const amount = parseFloat(amountFromEl.value);
    
    if (isNaN(amount)) {
        amountToEl.value = '';
        rateEl.innerText = 'Please enter a valid amount';
        return;
    }
    
    try {
        let rate;
        
        if (Object.keys(exchangeRates).length > 0) {
            // Use cached rates if available
            if (fromCurrency === 'USD') {
                rate = exchangeRates[toCurrency];
            } else if (toCurrency === 'USD') {
                rate = 1 / exchangeRates[fromCurrency];
            } else {
                // Convert through USD
                const fromRate = exchangeRates[fromCurrency];
                const toRate = exchangeRates[toCurrency];
                rate = toRate / fromRate;
            }
        } else {
            // Fetch specific rate if cached rates not available
            const response = await fetch(`${API_URL}${fromCurrency}`);
            const data = await response.json();
            
            if (data.result === 'success' || data.rates) {
                const rates = data.rates || data.conversion_rates;
                rate = rates[toCurrency];
            } else {
                showError('Failed to get exchange rate. Please try again.');
                return;
            }
        }
        
        const result = amount * rate;
        amountToEl.value = result.toFixed(2);
        rateEl.innerText = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
    } catch (error) {
        showError('Error calculating exchange rate. Please try again.');
    }
}

function addToHistory() {
    const fromCurrency = currencyFromEl.value;
    const toCurrency = currencyToEl.value;
    const fromAmount = parseFloat(amountFromEl.value);
    const toAmount = parseFloat(amountToEl.value);
    
    if (isNaN(fromAmount) || isNaN(toAmount)) return;
    
    const conversionItem = {
        from: fromCurrency,
        to: toCurrency,
        fromAmount,
        toAmount,
        date: new Date().toISOString()
    };
    
    conversionHistory.unshift(conversionItem);
    
    // Keep only the last 10 items
    if (conversionHistory.length > 10) {
        conversionHistory = conversionHistory.slice(0, 10);
    }
    
    saveHistory();
    updateHistoryUI();
}

function updateHistoryUI() {
    historyListEl.innerHTML = '';
    
    conversionHistory.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        
        const date = new Date(item.date);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        li.innerHTML = `
            <span>${item.fromAmount.toFixed(2)} ${item.from} = ${item.toAmount.toFixed(2)} ${item.to}</span>
            <span class="history-date">${formattedDate}</span>
        `;
        
        historyListEl.appendChild(li);
    });
}

function saveHistory() {
    localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
}

function loadHistory() {
    const savedHistory = localStorage.getItem('conversionHistory');
    if (savedHistory) {
        conversionHistory = JSON.parse(savedHistory);
        updateHistoryUI();
    }
}

function clearHistory() {
    conversionHistory = [];
    localStorage.removeItem('conversionHistory');
    updateHistoryUI();
}

function showError(message) {
    rateEl.innerText = message;
    rateEl.style.color = '#e74c3c';
    
    setTimeout(() => {
        rateEl.style.color = '';
    }, 3000);
}

initialize();
