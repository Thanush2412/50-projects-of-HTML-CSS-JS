document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('grade-form');
    const nameInput = document.getElementById('student-name');
    const subjectInput = document.getElementById('subject');
    const gradeInput = document.getElementById('grade');
    const commentsInput = document.getElementById('comments');
    const feedbackHistory = document.getElementById('feedback-history');
    const alertContainer = document.getElementById('alert-container');
    
    let students = [];
    
    function getGradeLevel(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }
    
    function getAlertType(score) {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'average';
        if (score >= 60) return 'poor';
        return 'fail';
    }
    
    // NEW CONCEPT: Tagged Template Literals
    // This function processes template strings with custom logic
    function gradeFeedback(strings, student, subject, score) {
        const gradeLevel = getGradeLevel(score);
        let feedback;
        
        switch (gradeLevel) {
            case 'A':
                feedback = `Excellent work in ${subject}! Keep up the outstanding performance.`;
                break;
            case 'B':
                feedback = `Good job in ${subject}. You're showing strong understanding.`;
                break;
            case 'C':
                feedback = `Satisfactory work in ${subject}. There's room for improvement.`;
                break;
            case 'D':
                feedback = `You're struggling with ${subject}. Let's schedule extra help.`;
                break;
            case 'F':
                feedback = `Urgent attention needed in ${subject}. Please see me after class.`;
                break;
        }
        
        return `${strings[0]}${student}${strings[1]}${feedback}`;
    }
    
    // NEW CONCEPT: Proxy API for reactive data
    // This creates a proxy that intercepts property access and modifications
    function createReactiveStudent(student) {
        return new Proxy(student, {
            set(target, property, value) {
                // Use Reflect API to set the property
                const result = Reflect.set(target, property, value);
                
                // If we're updating the grade, trigger UI updates
                if (property === 'grade') {
                    updateFeedbackUI(target);
                    showCustomAlert(target);
                }
                
                return result;
            },
            get(target, property) {
                // Log property access (for demonstration)
                console.log(`Accessing ${property} property`);
                
                // Use Reflect API to get the property
                return Reflect.get(target, property);
            }
        });
    }
    
    function updateFeedbackUI(student) {
        // Create feedback card
        const feedbackCard = document.createElement('div');
        const gradeLevel = getGradeLevel(student.grade);
        feedbackCard.className = `feedback-card grade-${gradeLevel.toLowerCase()}`;
        
        // Create feedback content using tagged template literal
        const message = gradeFeedback`Student: ${student.name} - ${student.subject} - ${student.grade}`;
        
        feedbackCard.innerHTML = `
            <h3>${student.name} - ${student.subject}</h3>
            <p>Grade: ${student.grade} (${gradeLevel})</p>
            <p>${message}</p>
            ${student.comments ? `<p>Comments: ${student.comments}</p>` : ''}
            <p class="timestamp">Added: ${new Date().toLocaleString()}</p>
        `;
        
        // Add to history
        feedbackHistory.prepend(feedbackCard);
    }
    
    function showCustomAlert(student) {
        const alertType = getAlertType(student.grade);
        const gradeLevel = getGradeLevel(student.grade);
        
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `custom-alert alert-${alertType}`;
        
        // Alert content
        alertElement.innerHTML = `
            <div class="custom-alert-header">
                <span class="custom-alert-title">Grade ${gradeLevel}</span>
                <button class="custom-alert-close">&times;</button>
            </div>
            <div class="custom-alert-body">
                <p>${student.name} received a ${student.grade} in ${student.subject}</p>
            </div>
        `;
        
        // Add close functionality
        const closeButton = alertElement.querySelector('.custom-alert-close');
        closeButton.addEventListener('click', () => {
            alertElement.remove();
        });
        
        // Add to container
        alertContainer.appendChild(alertElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 5000);
    }
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get values
        const name = nameInput.value;
        const subject = subjectInput.options[subjectInput.selectedIndex].text;
        const grade = parseInt(gradeInput.value);
        const comments = commentsInput.value;
        
        // Create student object with reactive properties
        const student = createReactiveStudent({
            name,
            subject,
            comments,
            date: new Date()
        });
        
        // Setting the grade property will trigger the proxy's set trap
        student.grade = grade;
        
        // Add to students array
        students.push(student);
        
        // Reset form
        form.reset();
    });
    
    // Demo data for initial display
    function addDemoData() {
        const demoStudents = [
            { name: "Emma Johnson", subject: "Mathematics", grade: 95, comments: "Excellent problem-solving skills" },
            { name: "Noah Williams", subject: "Science", grade: 82, comments: "Good lab work, needs to improve written responses" },
            { name: "Olivia Brown", subject: "English", grade: 78, comments: "Creative writing is strong, grammar needs work" },
            { name: "Liam Davis", subject: "History", grade: 65, comments: "Struggles with dates and chronology" }
        ];
        
        demoStudents.forEach(data => {
            const student = createReactiveStudent({
                name: data.name,
                subject: data.subject,
                comments: data.comments,
                date: new Date(Date.now() - Math.floor(Math.random() * 1000000))
            });
            
            // Setting the grade property will trigger the proxy's set trap
            student.grade = data.grade;
            
            // Add to students array
            students.push(student);
        });
    }
    
    // Initialize with demo data
    addDemoData();
});
