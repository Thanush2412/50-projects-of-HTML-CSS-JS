// DOM Elements
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income-total');
const expenseEl = document.getElementById('expense-total');
const transactionList = document.getElementById('transaction-list');
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const filterTypeSelect = document.getElementById('filter-type');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const monthlyIncomeEl = document.getElementById('monthly-income');
const monthlyExpensesEl = document.getElementById('monthly-expenses');
const monthlySavingsEl = document.getElementById('monthly-savings');
const currentMonthEl = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const categoryList = document.getElementById('category-list');
const budgetForm = document.getElementById('budget-form');
const monthlyBudgetInput = document.getElementById('monthly-budget');
const budgetProgressBar = document.getElementById('budget-progress-bar');
const budgetSpentEl = document.getElementById('budget-spent');
const budgetLimitEl = document.getElementById('budget-limit');
const budgetMessage = document.querySelector('.budget-message');
const resetBtn = document.getElementById('reset-btn');

// Initialize variables
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
let currentDate = new Date();
let currentFilter = 'all';

function init() {
    setCurrentDateInput();
    setCurrentMonthDisplay();
    setupEventListeners();
    updateCategoryOptions();
    updateUI();
    updateMonthlyStats();
    updateBudgetDisplay();
}

function setCurrentDateInput() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
}

function setCurrentMonthDisplay() {
    const options = { month: 'long', year: 'numeric' };
    currentMonthEl.textContent = currentDate.toLocaleDateString('en-US', options);
}

function formatMoney(amount) {
    return '$' + Math.abs(amount).toFixed(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateBalance() {
    // Set defaults if no transactions
    if (transactions.length === 0) {
        balanceEl.textContent = formatMoney(0);
        incomeEl.textContent = formatMoney(0);
        expenseEl.textContent = formatMoney(0);
        return;
    }
    
    // Calculate total income and expense
    let income = 0;
    let expense = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }
    });
    
    // Calculate balance (income - expense)
    const total = income - expense;
    
    // Update UI
    balanceEl.textContent = formatMoney(total);
    incomeEl.textContent = formatMoney(income);
    expenseEl.textContent = formatMoney(expense);
}

function addTransactionToDOM(transaction) {
    const item = document.createElement('li');
    item.classList.add(transaction.type === 'income' ? 'income-item' : 'expense-item');
    
    const formattedCategory = transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1);
    
    item.innerHTML = `
        <div class="transaction-details">
            <div class="transaction-description">${transaction.description}</div>
            <div class="transaction-category"><span class="category-badge ${transaction.type}">${formattedCategory}</span></div>
            <div class="transaction-date">${formatDate(transaction.date)}</div>
        </div>
        <span class="transaction-amount">${formatMoney(transaction.amount)}</span>
        <button class="delete-btn" data-id="${transaction.id}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    const deleteBtn = item.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        removeTransaction(transaction.id);
    });
    
    transactionList.appendChild(item);
}

function updateTransactionHistory() {
    transactionList.innerHTML = '';
    
    // Sort transactions by date (newest first)
    let filteredTransactions = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Apply filter if not showing all
    if (currentFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === currentFilter);
    }
    
    // Show message if no transactions
    if (filteredTransactions.length === 0) {
        transactionList.innerHTML = '<p class="empty-message">No transactions found</p>';
        return;
    }
    
    // Add each transaction to the DOM
    filteredTransactions.forEach(addTransactionToDOM);
}

function updateUI() {
    updateBalance();
    updateTransactionHistory();
}

function addTransaction(e) {
    e.preventDefault();
    
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;
    
    if (description === '' || isNaN(amount) || amount <= 0) {
        showAlert('Please enter a valid description and positive amount', 'error');
        return;
    }
    
    const transaction = {
        id: generateID(),
        description,
        amount,
        type,
        category,
        date,
        timestamp: new Date().toISOString()
    };
    
    transactions.push(transaction);
    updateLocalStorage();
    updateUI();
    updateMonthlyStats();
    updateBudgetDisplay();
    
    showAlert(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    
    descriptionInput.value = '';
    amountInput.value = '';
    setCurrentDateInput();
}

function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    updateUI();
    updateMonthlyStats();
    updateBudgetDisplay();
    showAlert('Transaction removed successfully', 'success');
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('monthlyBudget', monthlyBudget.toString());
}

function isTransactionInCurrentMonth(transaction) {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentDate.getMonth() && 
           transactionDate.getFullYear() === currentDate.getFullYear();
}

function updateMonthlyStats() {
    // Get only transactions for current month
    const monthlyTransactions = transactions.filter(isTransactionInCurrentMonth);
    
    // Handle empty state
    if (monthlyTransactions.length === 0) {
        monthlyIncomeEl.textContent = formatMoney(0);
        monthlyExpensesEl.textContent = formatMoney(0);
        monthlySavingsEl.textContent = formatMoney(0);
        categoryList.innerHTML = '<p class="empty-message">No transactions for this month</p>';
        return;
    }
    
    // Calculate monthly income and expenses
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    
    monthlyTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            monthlyIncome += transaction.amount;
        } else {
            monthlyExpenses += transaction.amount;
        }
    });
    
    // Calculate savings (income - expenses)
    const monthlySavings = monthlyIncome - monthlyExpenses;
    
    // Update UI
    monthlyIncomeEl.textContent = formatMoney(monthlyIncome);
    monthlyExpensesEl.textContent = formatMoney(monthlyExpenses);
    monthlySavingsEl.textContent = formatMoney(monthlySavings);
    
    // Update category breakdown
    updateCategoryBreakdown(monthlyTransactions);
}

function updateCategoryBreakdown(monthlyTransactions) {
    categoryList.innerHTML = '';
    
    const expenseCategories = {};
    
    monthlyTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (expenseCategories[t.category]) {
                expenseCategories[t.category] += t.amount;
            } else {
                expenseCategories[t.category] = t.amount;
            }
        });
    
    const categoryColors = {
        food: '#e74c3c',
        housing: '#3498db',
        transportation: '#2ecc71',
        utilities: '#f1c40f',
        entertainment: '#9b59b6',
        healthcare: '#1abc9c',
        personal: '#e67e22',
        education: '#34495e',
        other: '#95a5a6'
    };
    
    const sortedCategories = Object.entries(expenseCategories)
        .sort((a, b) => b[1] - a[1]);
    
    if (sortedCategories.length === 0) {
        categoryList.innerHTML = '<p class="empty-message">No expenses for this month</p>';
        return;
    }
    
    sortedCategories.forEach(([category, amount]) => {
        const categoryItem = document.createElement('li');
        categoryItem.className = 'category-item';
        
        const color = categoryColors[category] || '#95a5a6';
        
        categoryItem.innerHTML = `
            <div class="category-name">
                <span class="category-color" style="background-color: ${color}"></span>
                ${category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
            <div class="category-amount">${formatMoney(amount)}</div>
        `;
        
        categoryList.appendChild(categoryItem);
    });
}

function changeMonth(amount) {
    currentDate.setMonth(currentDate.getMonth() + amount);
    setCurrentMonthDisplay();
    updateMonthlyStats();
    updateBudgetDisplay();
}

function updateCategoryOptions() {
    const incomeCategories = categoryInput.querySelectorAll('.income-category');
    const expenseCategories = categoryInput.querySelectorAll('.expense-category');
    
    function showCategories(type) {
        if (type === 'income') {
            incomeCategories.forEach(option => option.style.display = 'block');
            expenseCategories.forEach(option => option.style.display = 'none');
            categoryInput.value = 'salary';
        } else {
            incomeCategories.forEach(option => option.style.display = 'none');
            expenseCategories.forEach(option => option.style.display = 'block');
            categoryInput.value = 'food';
        }
    }
    
    showCategories(typeInput.value);
    typeInput.addEventListener('change', () => showCategories(typeInput.value));
}

function updateBudgetDisplay() {
    const monthlyTransactions = transactions.filter(isTransactionInCurrentMonth);
    const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
    
    budgetSpentEl.textContent = formatMoney(monthlyExpenses);
    
    if (monthlyBudget > 0) {
        budgetLimitEl.textContent = formatMoney(monthlyBudget);
        
        const percentSpent = (monthlyExpenses / monthlyBudget) * 100;
        budgetProgressBar.style.width = `${Math.min(percentSpent, 100)}%`;
        
        if (percentSpent < 50) {
            budgetMessage.textContent = "You're doing great with your budget!";
            budgetProgressBar.style.backgroundColor = 'var(--income-color)';
        } else if (percentSpent < 80) {
            budgetMessage.textContent = "You're on track with your budget";
            budgetProgressBar.style.backgroundColor = '#f1c40f';
        } else if (percentSpent < 100) {
            budgetMessage.textContent = "You're approaching your budget limit";
            budgetProgressBar.style.backgroundColor = '#e67e22';
        } else {
            budgetMessage.textContent = "You've exceeded your budget!";
            budgetProgressBar.style.backgroundColor = 'var(--expense-color)';
        }
    } else {
        budgetProgressBar.style.width = '0%';
        budgetLimitEl.textContent = 'Not Set';
        budgetMessage.textContent = 'Set a monthly budget to track your spending';
    }
}

function saveBudget(e) {
    e.preventDefault();
    
    const budget = parseFloat(monthlyBudgetInput.value);
    
    if (isNaN(budget) || budget < 0) {
        showAlert('Please enter a valid budget amount', 'error');
        return;
    }
    
    monthlyBudget = budget;
    updateLocalStorage();
    updateBudgetDisplay();
    
    showAlert('Budget updated successfully', 'success');
    monthlyBudgetInput.value = '';
}

function showAlert(message, type) {
    const alertBox = document.createElement('div');
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;
    
    document.querySelector('.container').insertBefore(alertBox, document.querySelector('header').nextSibling);
    
    // Make alert visible
    alertBox.style.opacity = '1';
    
    // Remove alert after 3 seconds
    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => alertBox.remove(), 300);
    }, 3000);
}

function switchTab(tabName) {
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `${tabName}-tab`);
    });
}

function filterTransactions(filterValue) {
    currentFilter = filterValue;
    updateTransactionHistory();
}

function setupEventListeners() {
    transactionForm.addEventListener('submit', addTransaction);
    budgetForm.addEventListener('submit', saveBudget);
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    filterTypeSelect.addEventListener('change', () => filterTransactions(filterTypeSelect.value));
    resetBtn.addEventListener('click', resetAllData);
}

function resetAllData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        transactions = [];
        monthlyBudget = 0;
        currentDate = new Date();
        currentFilter = 'all';
        
        localStorage.removeItem('transactions');
        localStorage.removeItem('monthlyBudget');
        
        updateUI();
        updateMonthlyStats();
        updateBudgetDisplay();
        setCurrentMonthDisplay();
        setCurrentDateInput();
        
        transactionForm.reset();
        budgetForm.reset();
        filterTypeSelect.value = 'all';
        
        showAlert('All data has been reset', 'success');
    }
}

init();
