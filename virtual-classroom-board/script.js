const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const tools = document.querySelectorAll('.tool');
const shapesPanel = document.getElementById('shapes-panel');
const shapeButtons = document.querySelectorAll('.shape-btn');
const colorPicker = document.getElementById('color-picker');
const lineWidth = document.getElementById('line-width');
const clearBtn = document.getElementById('clear');
const saveBtn = document.getElementById('save');

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

// Initialize canvas
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pencil';
let currentShape = 'rectangle';
let startX, startY;

// Tool selection
tools.forEach(tool => {
    tool.addEventListener('click', () => {
        // Remove active class from all tools
        tools.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tool
        tool.classList.add('active');
        
        // Set current tool
        currentTool = tool.id;
        
        // Show shapes panel if shapes tool is selected
        if (currentTool === 'shapes') {
            shapesPanel.classList.add('active');
        } else {
            shapesPanel.classList.remove('active');
        }
    });
});

// Shape selection
shapeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all shape buttons
        shapeButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Set current shape
        currentShape = button.dataset.shape;
    });
});

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    
    // Get mouse position
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    
    // Save start position for shapes
    startX = lastX;
    startY = lastY;
    
    // Start path for pencil
    if (currentTool === 'pencil') {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    // Get mouse position
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Set drawing styles
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = lineWidth.value;
    ctx.lineCap = 'round';
    
    // Draw based on selected tool
    if (currentTool === 'pencil') {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (currentTool === 'eraser') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    
    // Update last position
    lastX = x;
    lastY = y;
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    
    // Complete the shape if shapes tool is selected
    if (currentTool === 'shapes') {
        drawShape();
    }
    
    // End path for pencil or eraser
    if (currentTool === 'pencil' || currentTool === 'eraser') {
        ctx.closePath();
    }
}

function drawShape() {
    // Set drawing styles
    ctx.strokeStyle = colorPicker.value;
    ctx.fillStyle = colorPicker.value;
    ctx.lineWidth = lineWidth.value;
    
    // Calculate dimensions
    const width = lastX - startX;
    const height = lastY - startY;
    const radius = Math.sqrt(width * width + height * height);
    
    // Draw based on selected shape
    switch (currentShape) {
        case 'rectangle':
            ctx.strokeRect(startX, startY, width, height);
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'line':
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(lastX, lastY);
            ctx.stroke();
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(lastX, startY);
            ctx.lineTo((startX + lastX) / 2, lastY);
            ctx.closePath();
            ctx.stroke();
            break;
    }
}

// Text tool
function addText(e) {
    if (currentTool !== 'text') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const text = prompt('Enter text:');
    if (!text) return;
    
    ctx.font = `${lineWidth.value * 5}px Arial`;
    ctx.fillStyle = colorPicker.value;
    ctx.fillText(text, x, y);
}

// Clear canvas
function clearCanvas() {
    if (confirm('Are you sure you want to clear the board?')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Save canvas as image
function saveCanvas() {
    const link = document.createElement('a');
    link.download = 'classroom-board.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('click', addText);
clearBtn.addEventListener('click', clearCanvas);
saveBtn.addEventListener('click', saveCanvas);

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});
