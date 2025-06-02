document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const questionButtons = document.querySelectorAll('.question-btn');
    
    // Sample responses for common questions
    const responses = {
        'hours': 'School hours are Monday to Friday, 8:00 AM to 3:30 PM.',
        'library': 'The library is located in the east wing of the main building, next to the computer lab. It\'s open from 7:30 AM to 4:30 PM.',
        'holiday': 'The next school holiday is Winter Break, starting December 20th and ending January 5th.',
        'club': 'To join a club, check the Activities Board in the main hallway for meeting times, or visit the Student Activities Office in Room 103.',
        'principal': 'The principal is Dr. Sarah Johnson. Her office is in the Administrative Wing, Room A-12.',
        'lunch': 'Lunch periods are: 11:00-11:45 AM for grades K-5, 11:50-12:35 PM for grades 6-8, and 12:40-1:25 PM for grades 9-12.',
        'uniform': 'School uniform consists of navy blue or khaki pants/skirts and white or light blue shirts/blouses. PE uniform is a gray t-shirt and navy shorts.',
        'bus': 'School buses arrive between 7:30-7:45 AM and depart at 3:45 PM. Bus schedules are available in the main office.',
        'sports': 'Our school offers basketball, soccer, track, swimming, volleyball, and tennis. Try-outs are held at the beginning of each season.',
        'contact': 'The main office number is (555) 123-4567. The email address is info@schoolname.edu.'
    };
    
    // Keywords to match in user questions
    const keywords = {
        'hours': ['hour', 'time', 'open', 'close', 'schedule'],
        'library': ['library', 'book', 'borrow', 'study'],
        'holiday': ['holiday', 'break', 'vacation', 'day off', 'no school'],
        'club': ['club', 'join', 'activity', 'extracurricular'],
        'principal': ['principal', 'head', 'in charge', 'leader', 'dr. johnson', 'sarah johnson'],
        'lunch': ['lunch', 'food', 'cafeteria', 'eat', 'meal'],
        'uniform': ['uniform', 'dress code', 'clothes', 'wear'],
        'bus': ['bus', 'transportation', 'ride', 'pickup', 'drop off'],
        'sports': ['sport', 'team', 'athletic', 'play', 'tryout', 'coach'],
        'contact': ['contact', 'phone', 'call', 'email', 'reach']
    };
    
    // Default responses when no match is found
    const defaultResponses = [
        "I'm not sure I understand. Could you rephrase your question?",
        "I don't have information about that yet. Is there something else I can help with?",
        "That's beyond my knowledge. Perhaps ask at the school office for more details.",
        "I'm still learning! Could you try asking about school hours, library, holidays, clubs, or the principal?"
    ];
    
    // Add a user message to the chat
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        messageElement.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    // Add a bot message to the chat
    function addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot';
        messageElement.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    // Show typing animation
    function showTyping() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message bot typing';
        typingElement.id = 'typing';
        typingElement.innerHTML = `
            <div class="message-content">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatBox.appendChild(typingElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    // Remove typing animation
    function removeTyping() {
        const typingElement = document.getElementById('typing');
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    // Process user input and generate a response
    function processInput(input) {
        const lowerInput = input.toLowerCase();
        
        // Check for matches with keywords
        for (const [category, words] of Object.entries(keywords)) {
            for (const word of words) {
                if (lowerInput.includes(word)) {
                    return responses[category];
                }
            }
        }
        
        // If no match, return a random default response
        const randomIndex = Math.floor(Math.random() * defaultResponses.length);
        return defaultResponses[randomIndex];
    }
    
    // Handle sending a message
    function sendMessage() {
        const message = userInput.value.trim();
        
        if (message) {
            // Add user message to chat
            addUserMessage(message);
            
            // Clear input
            userInput.value = '';
            
            // Show typing animation
            showTyping();
            
            // Process after a short delay to simulate thinking
            setTimeout(() => {
                // Remove typing animation
                removeTyping();
                
                // Generate and add bot response
                const response = processInput(message);
                addBotMessage(response);
            }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Sample question buttons
    questionButtons.forEach(button => {
        button.addEventListener('click', () => {
            userInput.value = button.textContent;
            sendMessage();
        });
    });
});
