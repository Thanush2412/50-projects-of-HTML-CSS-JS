document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const calendarDays = document.getElementById('calendar-days');
    const monthDisplay = document.getElementById('month-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventForm = document.getElementById('event-form');
    const selectedDateInput = document.getElementById('selected-date');
    const eventTitleInput = document.getElementById('event-title');
    const eventTimeInput = document.getElementById('event-time');
    const saveEventBtn = document.getElementById('save-event');
    const cancelEventBtn = document.getElementById('cancel-event');
    const eventsContainer = document.getElementById('events-container');
    const eventsDate = document.getElementById('events-date');
    
    // State
    let currentDate = new Date();
    let selectedDate = null;
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    
    // Initialize
    renderCalendar();
    
    // Event Listeners
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    saveEventBtn.addEventListener('click', saveEvent);
    cancelEventBtn.addEventListener('click', hideEventForm);
    
    // Functions
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update month display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
        
        // Clear calendar
        calendarDays.innerHTML = '';
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get days from previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Add days from previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayElement = createDayElement(daysInPrevMonth - i, true);
            calendarDays.appendChild(dayElement);
        }
        
        // Add days of current month
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = today.getDate() === i && 
                           today.getMonth() === month && 
                           today.getFullYear() === year;
            
            const dateString = formatDateString(year, month, i);
            const hasEvents = events[dateString] && events[dateString].length > 0;
            
            const dayElement = createDayElement(i, false, isToday, hasEvents);
            dayElement.addEventListener('click', () => selectDate(year, month, i));
            calendarDays.appendChild(dayElement);
        }
        
        // Fill remaining slots with next month's days
        const totalCells = 42; // 6 rows of 7 days
        const remainingCells = totalCells - (firstDay + daysInMonth);
        
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = createDayElement(i, true);
            calendarDays.appendChild(dayElement);
        }
        
        // If a date was previously selected, try to select it again if it's in the current month
        if (selectedDate) {
            const sameMonthYear = selectedDate.getMonth() === month && 
                                 selectedDate.getFullYear() === year;
            if (sameMonthYear) {
                selectDate(year, month, selectedDate.getDate());
            } else {
                selectedDate = null;
                hideEventForm();
                eventsDate.textContent = 'today';
                eventsContainer.innerHTML = '';
            }
        }
    }
    
    function createDayElement(day, isOtherMonth, isToday = false, hasEvents = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = day;
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        if (hasEvents) {
            dayElement.classList.add('has-events');
        }
        
        return dayElement;
    }
    
    function selectDate(year, month, day) {
        // Remove selected class from previously selected day
        const selectedDay = document.querySelector('.day.selected');
        if (selectedDay) {
            selectedDay.classList.remove('selected');
        }
        
        // Find and select the new day
        const dayElements = document.querySelectorAll('.day:not(.other-month)');
        dayElements[day - 1].classList.add('selected');
        
        // Update selected date
        selectedDate = new Date(year, month, day);
        
        // Show event form
        selectedDateInput.value = formatDateString(year, month, day);
        eventTitleInput.value = '';
        eventTimeInput.value = '';
        eventForm.classList.add('active');
        
        // Update events list
        updateEventsList();
    }
    
    function saveEvent() {
        const dateString = selectedDateInput.value;
        const title = eventTitleInput.value.trim();
        const time = eventTimeInput.value;
        
        if (!title) {
            alert('Please enter an event title');
            return;
        }
        
        // Create event object
        const event = {
            title,
            time,
            id: Date.now() // Simple unique ID
        };
        
        // Add event to storage
        if (!events[dateString]) {
            events[dateString] = [];
        }
        
        events[dateString].push(event);
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        // Update UI
        hideEventForm();
        renderCalendar(); // Re-render to show event indicators
        updateEventsList();
    }
    
    function hideEventForm() {
        eventForm.classList.remove('active');
    }
    
    function updateEventsList() {
        if (!selectedDate) return;
        
        const dateString = formatDateString(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
        );
        
        // Update header
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        eventsDate.textContent = selectedDate.toLocaleDateString(undefined, options);
        
        // Clear container
        eventsContainer.innerHTML = '';
        
        // Add events
        const dateEvents = events[dateString] || [];
        
        if (dateEvents.length === 0) {
            eventsContainer.innerHTML = '<p>No events for this date</p>';
            return;
        }
        
        // Sort events by time
        dateEvents.sort((a, b) => {
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time);
        });
        
        // Create event elements
        dateEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            
            const timeDisplay = event.time ? formatTime(event.time) : 'All day';
            
            eventElement.innerHTML = `
                <div class="event-title">${event.title}</div>
                <div class="event-time">${timeDisplay}</div>
                <button class="delete-event" data-id="${event.id}">×</button>
            `;
            
            // Add delete functionality
            const deleteBtn = eventElement.querySelector('.delete-event');
            deleteBtn.addEventListener('click', () => deleteEvent(dateString, event.id));
            
            eventsContainer.appendChild(eventElement);
        });
    }
    
    function deleteEvent(dateString, eventId) {
        events[dateString] = events[dateString].filter(event => event.id !== eventId);
        
        if (events[dateString].length === 0) {
            delete events[dateString];
        }
        
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        // Update UI
        renderCalendar();
        updateEventsList();
    }
    
    function formatDateString(year, month, day) {
        return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    
    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${period}`;
    }
});
