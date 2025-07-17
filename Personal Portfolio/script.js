// Throttle function for scroll events
function throttle(fn, wait) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.navbar-links a');
const revealElements = document.querySelectorAll('.reveal');

function onScroll() {
  // Nav highlight
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 80;
    if (pageYOffset >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
  // Reveal animation
  const windowHeight = window.innerHeight;
  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - 60) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });
}

window.addEventListener('scroll', throttle(onScroll, 60));
window.addEventListener('load', onScroll);

// Smooth scroll for anchor links
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href').slice(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      e.preventDefault();
      window.scrollTo({
        top: targetSection.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// Hamburger menu for mobile
const navbarToggle = document.querySelector('.navbar-toggle');
const navbarLinks = document.querySelector('.navbar-links');
navbarToggle.addEventListener('click', () => {
  navbarLinks.classList.toggle('open');
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 700) {
    navbarLinks.classList.remove('open');
  }
}); 