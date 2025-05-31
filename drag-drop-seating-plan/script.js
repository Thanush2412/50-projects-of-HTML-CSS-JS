const classroomGrid = document.querySelector('.classroom-grid');
const studentList = document.getElementById('student-list');
const newStudentInput = document.getElementById('new-student');
const addStudentBtn = document.getElementById('add-student');
const resetSeatingBtn = document.getElementById('reset-seating');

// Initial student names
const initialStudents = [
    'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 
    'William', 'Sophia', 'James', 'Isabella', 'Logan',
    'Charlotte', 'Benjamin', 'Amelia', 'Mason', 'Harper'
];

// Create seats
function createSeats() {
    classroomGrid.innerHTML = '';
    
    for (let i = 0; i < 25; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.dataset.seatId = i;
        seat.textContent = `Seat ${i + 1}`;
        
        // Add drag and drop event listeners to seats
        seat.addEventListener('dragover', handleDragOver);
        seat.addEventListener('dragleave', handleDragLeave);
        seat.addEventListener('drop', handleDrop);
        
        classroomGrid.appendChild(seat);
    }
}

// Create student elements
function createStudentElements(students) {
    studentList.innerHTML = '';
    
    students.forEach(student => {
        if (!isStudentSeated(student)) {
            const studentElement = document.createElement('div');
            studentElement.className = 'student';
            studentElement.textContent = student;
            studentElement.draggable = true;
            
            // Add drag event listeners to student
            studentElement.addEventListener('dragstart', handleDragStart);
            studentElement.addEventListener('dragend', handleDragEnd);
            
            studentList.appendChild(studentElement);
        }
    });
}

// Check if student is already seated
function isStudentSeated(studentName) {
    const seats = document.querySelectorAll('.seat');
    for (const seat of seats) {
        if (seat.classList.contains('occupied') && seat.textContent === studentName) {
            return true;
        }
    }
    return false;
}

// Load seating plan from localStorage
function loadSeatingPlan() {
    const savedSeating = JSON.parse(localStorage.getItem('seatingPlan')) || {};
    
    Object.keys(savedSeating).forEach(seatId => {
        const seat = document.querySelector(`.seat[data-seat-id="${seatId}"]`);
        if (seat && savedSeating[seatId]) {
            seat.textContent = savedSeating[seatId];
            seat.classList.add('occupied');
        }
    });
}

// Save seating plan to localStorage
function saveSeatingPlan() {
    const seatingPlan = {};
    const occupiedSeats = document.querySelectorAll('.seat.occupied');
    
    occupiedSeats.forEach(seat => {
        seatingPlan[seat.dataset.seatId] = seat.textContent;
    });
    
    localStorage.setItem('seatingPlan', JSON.stringify(seatingPlan));
}

// Drag and drop event handlers
function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.textContent);
}

function handleDragEnd() {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('dragover');
}

function handleDragLeave() {
    this.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    
    const studentName = e.dataTransfer.getData('text/plain');
    
    // Only allow drop if seat is not occupied
    if (!this.classList.contains('occupied')) {
        this.textContent = studentName;
        this.classList.add('occupied');
        
        // Remove student from the list
        createStudentElements(getStudentList());
        
        // Save the updated seating plan
        saveSeatingPlan();
    }
}

// Get current list of students (both seated and unseated)
function getStudentList() {
    const students = [...initialStudents];
    
    // Add any custom students from localStorage
    const customStudents = JSON.parse(localStorage.getItem('customStudents')) || [];
    students.push(...customStudents);
    
    return students;
}

// Add new student
function addNewStudent() {
    const studentName = newStudentInput.value.trim();
    
    if (studentName) {
        // Save to localStorage
        const customStudents = JSON.parse(localStorage.getItem('customStudents')) || [];
        customStudents.push(studentName);
        localStorage.setItem('customStudents', JSON.stringify(customStudents));
        
        // Update the student list
        createStudentElements(getStudentList());
        
        // Clear the input
        newStudentInput.value = '';
    }
}

// Reset seating
function resetSeating() {
    const seats = document.querySelectorAll('.seat');
    seats.forEach(seat => {
        seat.classList.remove('occupied');
        seat.textContent = `Seat ${parseInt(seat.dataset.seatId) + 1}`;
    });
    
    // Clear localStorage seating plan
    localStorage.removeItem('seatingPlan');
    
    // Recreate student list
    createStudentElements(getStudentList());
}

// Event listeners
addStudentBtn.addEventListener('click', addNewStudent);
newStudentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addNewStudent();
    }
});
resetSeatingBtn.addEventListener('click', resetSeating);

// Initialize the app
createSeats();
createStudentElements(getStudentList());
loadSeatingPlan();
