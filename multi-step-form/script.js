document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('multiStepForm');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressBar = document.getElementById('progress');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const submitButton = document.querySelector('.submit-btn');
    const successMessage = document.getElementById('successMessage');
    const resetButton = document.getElementById('resetBtn');
    
    let currentStep = 1;
    const totalSteps = formSteps.length;
    
    function updateProgress() {
        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            
            if (stepNumber < currentStep) {
                step.classList.add('completed');
                step.classList.add('active');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active');
                step.classList.remove('completed');
            }
        });
        
        const progressWidth = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressWidth}%`;
    }
    
    function showStep(stepNumber) {
        formSteps.forEach(step => {
            step.classList.remove('active');
        });
        
        const stepToShow = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        stepToShow.classList.add('active');
        
        currentStep = stepNumber;
        updateProgress();
    }
    
    function validateStep(stepNumber) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        const inputFields = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        
        let isValid = true;
        
        inputFields.forEach(field => {
            clearError(field);
            
            if (field.type === 'checkbox' && !field.checked) {
                showError(field, 'This checkbox is required');
                isValid = false;
                return;
            }
            
            if (!field.checkValidity()) {
                let message = '';
                
                if (field.validity.valueMissing) {
                    message = 'This field is required';
                } else if (field.validity.typeMismatch) {
                    message = `Please enter a valid ${field.type}`;
                } else if (field.validity.tooShort) {
                    message = `Minimum length is ${field.minLength} characters`;
                } else if (field.validity.patternMismatch) {
                    if (field.id === 'password') {
                        message = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                    } else if (field.id === 'phone') {
                        message = 'Please enter a 10-digit phone number';
                    } else if (field.id === 'zipCode') {
                        message = 'Please enter a valid zip/postal code';
                    } else {
                        message = 'Please match the requested format';
                    }
                } else {
                    message = 'Invalid input';
                }
                
                showError(field, message);
                isValid = false;
            }
            
            if (field.id === 'confirmPassword' && field.value !== document.getElementById('password').value) {
                showError(field, 'Passwords do not match');
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function showError(field, message) {
        field.classList.add('invalid');
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
        }
    }
    
    function clearError(field) {
        field.classList.remove('invalid');
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
        }
    }
    
    function updateReviewSection() {
        const reviewPersonal = document.getElementById('reviewPersonal');
        const reviewAddress = document.getElementById('reviewAddress');
        const reviewAccount = document.getElementById('reviewAccount');
        
        reviewPersonal.innerHTML = `
            <p><strong>First Name:</strong> ${document.getElementById('firstName').value}</p>
            <p><strong>Last Name:</strong> ${document.getElementById('lastName').value}</p>
            <p><strong>Email:</strong> ${document.getElementById('email').value}</p>
            <p><strong>Phone:</strong> ${document.getElementById('phone').value}</p>
        `;
        
        reviewAddress.innerHTML = `
            <p><strong>Street:</strong> ${document.getElementById('street').value}</p>
            <p><strong>City:</strong> ${document.getElementById('city').value}</p>
            <p><strong>State/Province:</strong> ${document.getElementById('state').value}</p>
            <p><strong>Zip/Postal Code:</strong> ${document.getElementById('zipCode').value}</p>
        `;
        
        reviewAccount.innerHTML = `
            <p><strong>Username:</strong> ${document.getElementById('username').value}</p>
            <p><strong>Password:</strong> ${'•'.repeat(document.getElementById('password').value.length)}</p>
        `;
    }
    
    function saveFormData() {
        const formData = {
            personal: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value
            },
            address: {
                street: document.getElementById('street').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zipCode: document.getElementById('zipCode').value
            },
            account: {
                username: document.getElementById('username').value
            }
        };
        
        localStorage.setItem('formData', JSON.stringify(formData));
    }
    
    function loadFormData() {
        const savedData = localStorage.getItem('formData');
        
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            if (formData.personal) {
                document.getElementById('firstName').value = formData.personal.firstName || '';
                document.getElementById('lastName').value = formData.personal.lastName || '';
                document.getElementById('email').value = formData.personal.email || '';
                document.getElementById('phone').value = formData.personal.phone || '';
            }
            
            if (formData.address) {
                document.getElementById('street').value = formData.address.street || '';
                document.getElementById('city').value = formData.address.city || '';
                document.getElementById('state').value = formData.address.state || '';
                document.getElementById('zipCode').value = formData.address.zipCode || '';
            }
            
            if (formData.account) {
                document.getElementById('username').value = formData.account.username || '';
            }
        }
    }
    
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const stepNumber = parseInt(button.closest('.form-step').dataset.step);
            
            if (validateStep(stepNumber)) {
                if (stepNumber === 3) {
                    updateReviewSection();
                }
                
                saveFormData();
                showStep(stepNumber + 1);
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const stepNumber = parseInt(button.closest('.form-step').dataset.step);
            showStep(stepNumber - 1);
        });
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateStep(currentStep)) {
            saveFormData();
            
            form.reset();
            successMessage.classList.add('active');
            
            setTimeout(() => {
                localStorage.removeItem('formData');
            }, 2000);
        }
    });
    
    resetButton.addEventListener('click', () => {
        localStorage.removeItem('formData');
        successMessage.classList.remove('active');
        showStep(1);
        form.reset();
    });
    
    const inputFields = document.querySelectorAll('input, select, textarea');
    inputFields.forEach(field => {
        field.addEventListener('input', () => {
            clearError(field);
        });
    });
    
    document.getElementById('password').addEventListener('input', function() {
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword.value) {
            if (this.value !== confirmPassword.value) {
                showError(confirmPassword, 'Passwords do not match');
            } else {
                clearError(confirmPassword);
            }
        }
    });
    
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('password');
        if (this.value !== password.value) {
            showError(this, 'Passwords do not match');
        } else {
            clearError(this);
        }
    });
    
    loadFormData();
    updateProgress();
});
