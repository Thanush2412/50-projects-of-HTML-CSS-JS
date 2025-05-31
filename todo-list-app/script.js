const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-button');
const taskList = document.getElementById('task-list');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = [];
let currentFilter = 'all';

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
    };
    
    tasks.push(newTask);
    taskInput.value = '';
    
    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    
    saveTasks();
    renderTasks();
}

function toggleTaskStatus(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                completed: !task.completed
            };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
}

function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    
    saveTasks();
    renderTasks();
}

function setFilter(filter) {
    currentFilter = filter;
    
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTasks();
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    taskList.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
        
        const taskText = document.createElement('span');
        taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
        taskText.textContent = task.text;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '×';
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteButton);
        
        taskList.appendChild(taskItem);
    });
    
    const activeTasks = tasks.filter(task => !task.completed);
    tasksCounter.textContent = `${activeTasks.length} tasks left`;
}

addButton.addEventListener('click', addTask);

taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

clearCompletedBtn.addEventListener('click', clearCompletedTasks);

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        setFilter(filter);
    });
});

loadTasks();
