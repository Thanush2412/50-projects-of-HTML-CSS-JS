let studentData = {};
const months = ["Jan", "Feb", "Mar", "Apr", "May"];
const colors = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)"
];

let progressChart;
let currentStudent = "";
let chartType = "line";

function initializeDefaultData() {
    if (Object.keys(studentData).length === 0) {
        studentData = {
            john: {
                name: "John Smith",
                id: "ST12345",
                grade: "10th",
                avatar: "JS",
                attendance: 92,
                subjects: {}
            }
        };
        
        studentData.john.subjects = {
            Math: [78, 82, 88, 85, 90],
            Science: [85, 90, 92, 88, 95],
            English: [75, 78, 80, 82, 85]
        };
        
        calculateStudentStats();
        saveToLocalStorage();
    }
}

function calculateStudentStats() {
    const studentIds = Object.keys(studentData);
    
    studentIds.forEach(studentId => {
        const student = studentData[studentId];
        const subjects = student.subjects;
        
        if (Object.keys(subjects).length > 0) {
            let totalMarks = 0;
            let totalSubjects = 0;
            
            Object.keys(subjects).forEach(subject => {
                const marks = subjects[subject];
                if (marks && marks.length > 0) {
                    totalMarks += marks.reduce((sum, mark) => sum + mark, 0);
                    totalSubjects += marks.length;
                }
            });
            
            const averagePercentage = totalSubjects > 0 ? Math.round(totalMarks / totalSubjects) : 0;
            student.average = averagePercentage;
        } else {
            student.average = 0;
        }
    });
    
    const sortedStudents = studentIds
        .map(id => ({ id, average: studentData[id].average }))
        .sort((a, b) => b.average - a.average);
    
    sortedStudents.forEach((student, index) => {
        const rank = index + 1;
        let rankSuffix = "th";
        
        if (rank === 1) rankSuffix = "st";
        else if (rank === 2) rankSuffix = "nd";
        else if (rank === 3) rankSuffix = "rd";
        
        studentData[student.id].rank = rank + rankSuffix;
    });
}

function updateStudentInfo(studentId) {
    if (!studentData[studentId]) return;
    
    const student = studentData[studentId];
    
    document.querySelector('.avatar span').textContent = student.avatar;
    document.querySelector('.details h2').textContent = student.name;
    document.querySelector('.details p:nth-child(2)').textContent = `Student ID: ${student.id}`;
    document.querySelector('.details p:nth-child(3)').textContent = `Grade: ${student.grade}`;
    
    document.getElementById('average-value').textContent = `${student.average}%`;
    document.getElementById('attendance-value').textContent = `${student.attendance}%`;
    document.getElementById('rank-value').textContent = student.rank || "--";
    
    updateTable(studentId);
    updateChart(studentId, chartType);
}

function updateTable(studentId) {
    const student = studentData[studentId];
    const tableBody = document.querySelector('#subjects-table tbody');
    tableBody.innerHTML = '';
    
    Object.keys(student.subjects).forEach(subject => {
        const marks = student.subjects[subject];
        const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subject}</td>
            ${marks.map(mark => `<td>${mark}</td>`).join('')}
            <td><strong>${average.toFixed(1)}</strong></td>
        `;
        
        tableBody.appendChild(row);
    });
}

function updateChart(studentId, type) {
    const student = studentData[studentId];
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    const datasets = Object.keys(student.subjects).map((subject, index) => {
        const colorIndex = index % colors.length;
        return {
            label: subject,
            data: student.subjects[subject],
            backgroundColor: colors[colorIndex],
            borderColor: colors[colorIndex].replace('0.7', '1'),
            borderWidth: 2,
            tension: 0.3,
            fill: type === 'radar'
        };
    });
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    progressChart = new Chart(ctx, {
        type: type,
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 50,
                    max: 100,
                    ticks: {
                        stepSize: 10
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function updateStudentDropdowns() {
    const studentSelect = document.getElementById('student-select');
    const marksStudentSelect = document.getElementById('marks-student');
    
    [studentSelect, marksStudentSelect].forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = '';
        
        Object.keys(studentData).forEach(studentId => {
            const option = document.createElement('option');
            option.value = studentId;
            option.textContent = studentData[studentId].name;
            select.appendChild(option);
        });
        
        if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
            select.value = currentValue;
        } else if (select.options.length > 0) {
            select.selectedIndex = 0;
        }
    });
}

function getInitials(name) {
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
}

function addNewStudent(name, id, grade, attendance) {
    const studentId = name.toLowerCase().replace(/\s+/g, '-');
    
    if (studentData[studentId]) {
        alert('A student with this name already exists!');
        return false;
    }
    
    studentData[studentId] = {
        name: name,
        id: id,
        grade: grade,
        avatar: getInitials(name),
        attendance: parseInt(attendance),
        subjects: {}
    };
    
    calculateStudentStats();
    saveToLocalStorage();
    updateStudentDropdowns();
    
    if (!currentStudent) {
        currentStudent = studentId;
        document.getElementById('student-select').value = currentStudent;
        updateStudentInfo(currentStudent);
    }
    
    return true;
}

function addSubjectMarks(studentId, subject, marks) {
    if (!studentData[studentId]) return false;
    
    studentData[studentId].subjects[subject] = marks;
    
    calculateStudentStats();
    saveToLocalStorage();
    
    if (currentStudent === studentId) {
        updateStudentInfo(currentStudent);
    }
    
    return true;
}

function saveToLocalStorage() {
    localStorage.setItem('studentProgressData', JSON.stringify(studentData));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('studentProgressData');
    if (savedData) {
        studentData = JSON.parse(savedData);
        return true;
    }
    return false;
}

function setupEventListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    document.getElementById('student-select').addEventListener('change', function() {
        currentStudent = this.value;
        updateStudentInfo(currentStudent);
    });
    
    document.getElementById('chart-type').addEventListener('change', function() {
        chartType = this.value;
        updateChart(currentStudent, chartType);
    });
    
    document.getElementById('add-student-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('student-name').value;
        const id = document.getElementById('student-id').value;
        const grade = document.getElementById('student-grade').value;
        const attendance = document.getElementById('student-attendance').value;
        
        if (addNewStudent(name, id, grade, attendance)) {
            this.reset();
            alert('Student added successfully!');
        }
    });
    
    document.getElementById('add-marks-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const studentId = document.getElementById('marks-student').value;
        const subject = document.getElementById('subject-name').value;
        const marks = [
            parseInt(document.getElementById('jan-marks').value),
            parseInt(document.getElementById('feb-marks').value),
            parseInt(document.getElementById('mar-marks').value),
            parseInt(document.getElementById('apr-marks').value),
            parseInt(document.getElementById('may-marks').value)
        ];
        
        if (addSubjectMarks(studentId, subject, marks)) {
            this.reset();
            alert('Subject marks added successfully!');
        }
    });
}

function initialize() {
    if (!loadFromLocalStorage()) {
        initializeDefaultData();
    }
    
    updateStudentDropdowns();
    
    if (Object.keys(studentData).length > 0) {
        currentStudent = Object.keys(studentData)[0];
        updateStudentInfo(currentStudent);
    }
    
    setupEventListeners();
}

initialize();
