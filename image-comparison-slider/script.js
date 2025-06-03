const container = document.querySelector('.comparison-container');
const beforeImage = document.querySelector('.image-before');
const afterImage = document.querySelector('.image-after');
const sliderLine = document.querySelector('.slider-line');
const sliderButton = document.querySelector('.slider-button');
const sliderPosition = document.getElementById('slider-position');
const positionValue = document.getElementById('position-value');
const presetButtons = document.querySelectorAll('.preset-buttons button');

let isActive = false;
let containerWidth;

function initializeSlider() {
    containerWidth = container.offsetWidth;
    
    const initialPosition = parseInt(sliderPosition.value);
    setSliderPosition(initialPosition);
    
    container.addEventListener('mousedown', startSliding);
    container.addEventListener('touchstart', startSliding);
    
    window.addEventListener('mouseup', stopSliding);
    window.addEventListener('touchend', stopSliding);
    
    window.addEventListener('mousemove', moveSlider);
    window.addEventListener('touchmove', moveSlider);
    
    window.addEventListener('resize', () => {
        containerWidth = container.offsetWidth;
        const currentPosition = parseInt(sliderPosition.value);
        setSliderPosition(currentPosition);
    });
    
    sliderPosition.addEventListener('input', () => {
        const newPosition = parseInt(sliderPosition.value);
        setSliderPosition(newPosition);
        positionValue.textContent = `${newPosition}%`;
    });
    
    setupPresetButtons();
}

function startSliding(e) {
    isActive = true;
    
    if (e.type === 'touchstart') {
        const touch = e.touches[0];
        updateSliderPosition(touch.clientX);
    } else {
        updateSliderPosition(e.clientX);
    }
}

function stopSliding() {
    isActive = false;
}

function moveSlider(e) {
    if (!isActive) return;
    
    if (e.type === 'touchmove') {
        const touch = e.touches[0];
        updateSliderPosition(touch.clientX);
    } else {
        updateSliderPosition(e.clientX);
    }
}

function updateSliderPosition(clientX) {
    const containerRect = container.getBoundingClientRect();
    const position = clientX - containerRect.left;
    const percentage = (position / containerWidth) * 100;
    
    const boundedPercentage = Math.min(Math.max(percentage, 0), 100);
    
    setSliderPosition(boundedPercentage);
    sliderPosition.value = Math.round(boundedPercentage);
    positionValue.textContent = `${Math.round(boundedPercentage)}%`;
}

function setSliderPosition(percentage) {
    const position = `${percentage}%`;
    
    sliderLine.style.left = position;
    sliderButton.style.left = position;
    
    afterImage.style.clipPath = `polygon(0 0, ${position} 0, ${position} 100%, 0 100%)`;
}

function setupPresetButtons() {
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const beforeSrc = button.getAttribute('data-before');
            const afterSrc = button.getAttribute('data-after');
            
            if (beforeSrc && afterSrc) {
                beforeImage.src = beforeSrc;
                afterImage.src = afterSrc;
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initializeSlider();
});
