const counterValue = document.getElementById('counter-value');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');

let count = 0;

function updateDisplay() {
    counterValue.textContent = count;
}

incrementBtn.addEventListener('click', function() {
    count++;
    updateDisplay();
});

decrementBtn.addEventListener('click', function() {
    count--;
    updateDisplay();
});

resetBtn.addEventListener('click', function() {
    count = 0;
    updateDisplay();
});
