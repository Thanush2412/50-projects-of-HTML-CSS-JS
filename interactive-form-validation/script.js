const form = document.getElementById('signup-form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const phone = document.getElementById('phone');
const formSuccess = document.getElementById('form-success');
const resetBtn = document.getElementById('reset-btn');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateForm()) {
        form.style.display = 'none';
        formSuccess.classList.remove('hidden');
    }
});

resetBtn.addEventListener('click', function() {
    form.reset();
    form.style.display = 'block';
    formSuccess.classList.add('hidden');
    clearValidation();
});

function validateForm() {
    let isValid = true;
    
    if (!validateUsername()) {
        isValid = false;
    }
    
    if (!validateEmail()) {
        isValid = false;
    }
    
    if (!validatePassword()) {
        isValid = false;
    }
    
    if (!validateConfirmPassword()) {
        isValid = false;
    }
    
    if (!validatePhone()) {
        isValid = false;
    }
    
    return isValid;
}

function validateUsername() {
    const value = username.value.trim();
    
    if (value === '') {
        showError(username, 'Username cannot be empty');
        return false;
    } else if (value.length < 5) {
        showError(username, 'Username must be at least 5 characters');
        return false;
    } else if (value.length > 15) {
        showError(username, 'Username cannot exceed 15 characters');
        return false;
    } else {
        showSuccess(username);
        return true;
    }
}

function validateEmail() {
    const value = email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value === '') {
        showError(email, 'Email cannot be empty');
        return false;
    } else if (!emailRegex.test(value)) {
        showError(email, 'Please enter a valid email');
        return false;
    } else {
        showSuccess(email);
        return true;
    }
}

function validatePassword() {
    const value = password.value.trim();
    
    if (value === '') {
        showError(password, 'Password cannot be empty');
        return false;
    } else if (value.length < 8) {
        showError(password, 'Password must be at least 8 characters');
        return false;
    } else {
        showSuccess(password);
        return true;
    }
}

function validateConfirmPassword() {
    const passwordValue = password.value.trim();
    const confirmValue = confirmPassword.value.trim();
    
    if (confirmValue === '') {
        showError(confirmPassword, 'Please confirm your password');
        return false;
    } else if (confirmValue !== passwordValue) {
        showError(confirmPassword, 'Passwords do not match');
        return false;
    } else {
        showSuccess(confirmPassword);
        return true;
    }
}

function validatePhone() {
    const value = phone.value.trim();
    const phoneRegex = /^\d{10}$/;
    
    if (value === '') {
        showError(phone, 'Phone number cannot be empty');
        return false;
    } else if (!phoneRegex.test(value)) {
        showError(phone, 'Please enter a valid 10-digit number');
        return false;
    } else {
        showSuccess(phone);
        return true;
    }
}

function showError(input, message) {
    const formGroup = input.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');
    
    input.classList.remove('success');
    input.classList.add('error');
    errorMessage.textContent = message;
}

function showSuccess(input) {
    const formGroup = input.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');
    
    input.classList.remove('error');
    input.classList.add('success');
    errorMessage.textContent = '';
}

function clearValidation() {
    const inputs = form.querySelectorAll('input');
    const errorMessages = form.querySelectorAll('.error-message');
    
    inputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
    
    errorMessages.forEach(message => {
        message.textContent = '';
    });
}

username.addEventListener('input', validateUsername);
email.addEventListener('input', validateEmail);
password.addEventListener('input', validatePassword);
confirmPassword.addEventListener('input', validateConfirmPassword);
phone.addEventListener('input', validatePhone);
