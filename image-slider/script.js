const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const dots = document.querySelectorAll('.dot');
const playPauseBtn = document.getElementById('play-pause-btn');

let currentSlide = 0;
let slideInterval = setInterval(nextSlide, 5000);
let isPlaying = true;

function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    currentSlide = (n + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

function jumpToSlide() {
    let slideIndex = parseInt(this.getAttribute('data-index'));
    showSlide(slideIndex);
}

function togglePlayPause() {
    if (isPlaying) {
        clearInterval(slideInterval);
        playPauseBtn.textContent = 'Play';
    } else {
        slideInterval = setInterval(nextSlide, 5000);
        playPauseBtn.textContent = 'Pause';
    }
    
    isPlaying = !isPlaying;
}

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);
playPauseBtn.addEventListener('click', togglePlayPause);

dots.forEach(dot => {
    dot.addEventListener('click', jumpToSlide);
});

showSlide(0);
