const checkbox = document.getElementById('checkbox');
const themeLabel = document.getElementById('theme-label');

function changeTheme() {
    if (checkbox.checked) {
        document.body.classList.add('dark-theme');
        themeLabel.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'dark');
    } 
    else {
        document.body.classList.remove('dark-theme');
        themeLabel.textContent = 'Light Mode';
        localStorage.setItem('theme', 'light');
    }
}

checkbox.addEventListener('change', changeTheme);

const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
    checkbox.checked = true;
    document.body.classList.add('dark-theme');
    themeLabel.textContent = 'Dark Mode';
}
