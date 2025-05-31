const bulbContainer = document.getElementById('bulb-container');
const body = document.body;

// Check for saved theme preference or use default
const currentTheme = localStorage.getItem('theme') || 'light';

// Apply the saved theme or default
if (currentTheme === 'dark') {
    body.classList.add('dark-theme');
}

// Toggle theme when bulb is clicked
bulbContainer.addEventListener('click', function() {
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
});
