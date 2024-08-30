
// Simulated API using localStorage
const api = {
    getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    },
    saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    },
    getTask(id) {
        const tasks = this.getTasks();
        return tasks.find(task => task.id === id);
    },
    addTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        this.saveTasks(tasks);
    },
    updateTask(updatedTask) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(task => task.id === updatedTask.id);
        tasks[index] = updatedTask;
        this.saveTasks(tasks);
    },
    deleteTask(id) {
        let tasks = this.getTasks();
        tasks = tasks.filter(task => task.id !== id);
        this.saveTasks(tasks);
    },
    searchTasks(query) {
        const tasks = this.getTasks();
        return tasks.filter(task =>
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase()) ||
            task.dueDate.includes(query)
        );
    },
    filterTasksByPriority(priority) {
        const tasks = this.getTasks();
        return tasks.filter(task => task.priority === priority);
    }
};

// SPA logic
function loadContent(view) {
    const content = document.getElementById('content');

    if (view === 'view-tasks') {
        const tasks = api.getTasks();
        content.innerHTML = `
                    <h2 class="headtask">Task List</h2>
                    <input type="text" id="search" placeholder="Search tasks..." />
                    <button onclick="searchTasks()">Search</button><br><br>
                    <select id="filter-priority" onchange="filterTasks()">
                        <option value="">Filter by Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <ul id="task-list"></ul>
                `;
        // Add event listener for real-time search
        document.getElementById('search').addEventListener('input', searchTasks);

        displayTasks(tasks);
    } else if (view === 'add-task') {
        content.innerHTML = `
                    <h2 class="add">Add Task</h2>
                    <form id="task-form">
                        <input type="text" id="title" placeholder="Title" required><br><br>
                        <input type="text" id="description" placeholder="Description" required><br><br>
                        <input type="date" id="due-date" required><br><br>
                        <select id="priority" required>
                            <option  value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select><br><br>
                        <input type="datetime-local" id="reminder" placeholder="Set Reminder"><br><br>
                        <button type="submit">Add Task</button>
                    </form>
                `;
        document.getElementById('task-form').onsubmit = function (e) {
            e.preventDefault();
            addTask();
        };
    }
}

// displayimg task
function getPriorityColor(priority) {
    switch (priority) {
        case 'High':
            return 'red';
        case 'Medium':
            return 'orange';
        case 'Low':
            return 'green';
        default:
            return 'black'; // Default color if no priority matches
    }
}
// Display task details
function showTaskDetails(taskId) {
    const task = api.getTask(taskId);
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <h2 class="show">Task Details</h2>
        <div class="task-detail-view">
            <h3>${task.title}</h3>
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Due Date:</strong> ${task.dueDate}</p>
            <p><strong>Priority:</strong> <span style="color: ${getPriorityColor(task.priority)};">${task.priority}</span></p>
            <p><strong>Reminder:</strong> ${task.reminder || 'No reminder set'}</p>
            <button onclick="editTask('${task.id}')">Edit Task</button>
            <button onclick="deleteTask('${task.id}')">Delete Task</button>
            <button onclick="loadContent('view-tasks')">Back to Task List</button>
        </div>
    `;
}

function displayTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = tasks.map(task => `
        <li class="task-item" data-id="${task.id}" onclick="showTaskDetails('${task.id}')" draggable="true">
            <div class="task-details">
                <span> <strong>${task.title}</strong></span><br>
                <span>${task.description}</span><br>
                <div style="display: flex; justify-content: space-between; margin-top: 60px;">
                    <span style="margin-left: 0;">
                        <strong>Priority:</strong> 
                        <span style="color: ${getPriorityColor(task.priority)};">
                            ${task.priority}
                        </span>
                    </span>
                    <span style="margin-right: 0;">
                        <strong>Due:</strong> ${task.dueDate}
                    </span>
                </div>
            </div>
            <div class="task-actions" style="margin-top: 20px;">
                <button onclick="editTask('${task.id}')">Edit</button>
                <button onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        </li>
    `).join('');
    setupDragAndDrop();
}


// addtask functionality

function addTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date').value;
    const priority = document.getElementById('priority').value;
    const reminder = document.getElementById('reminder').value;

    const task = {
        id: Date.now().toString(),
        title,
        description,
        dueDate,
        priority,
        reminder // Added reminder to the task object
    };

    api.addTask(task);
    if (reminder) {
        scheduleReminder(reminder, task.title);
    }
    alert('Task added successfully!');
    loadContent('view-tasks');
}

function editTask(id) {
    const task = api.getTask(id);
    const content = document.getElementById('content');
    content.innerHTML = `
                <h2>Edit Task</h2>
                <form id="task-form">
                    <input type="text" id="title" value="${task.title}" required><br><br>
                    <input type="text" id="description" value="${task.description}" required><br><br>
                    <input type="date" id="due-date" value="${task.dueDate}" required><br><br>
                    <select id="priority" required>
                        <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
                        <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
                    </select><br><br>
                    <button type="submit">Save Changes</button>
                </form>
            `;
    document.getElementById('task-form').onsubmit = function (e) {
        e.preventDefault();
        task.title = document.getElementById('title').value;
        task.description = document.getElementById('description').value;
        task.dueDate = document.getElementById('due-date').value;
        task.priority = document.getElementById('priority').value;

        api.updateTask(task);
        alert('Task edited successfully!');
        loadContent('view-tasks');
    };
}

function deleteTask(id) {
    api.deleteTask(id);
    alert('Task deleted successfully!');
    loadContent('view-tasks');
}

function searchTasks() {
    const query = document.getElementById('search').value;
    const filteredTasks = api.searchTasks(query);
    displayTasks(filteredTasks);
}

function filterTasks() {
    const priority = document.getElementById('filter-priority').value;
    const filteredTasks = priority ? api.filterTasksByPriority(priority) : api.getTasks();
    displayTasks(filteredTasks);
}

// Drag-and-drop functionality
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData('text', event.target.closest('li').dataset.id);
}

function drop(event) {
    event.preventDefault();
    const draggedTaskId = event.dataTransfer.getData('text');
    const targetTaskId = event.target.closest('li').dataset.id;

    if (!draggedTaskId || !targetTaskId || draggedTaskId === targetTaskId) return;
    const tasks = api.getTasks();
    const draggedTaskIndex = tasks.findIndex(task => task.id === draggedTaskId);
    const targetTaskIndex = tasks.findIndex(task => task.id === targetTaskId);

    // Reorder tasks
    const [draggedTask] = tasks.splice(draggedTaskIndex, 1);
    tasks.splice(targetTaskIndex, 0, draggedTask);

    api.saveTasks(tasks);
    displayTasks(tasks);
}

// Attach event listeners for drag and drop
function setupDragAndDrop() {
    const taskList = document.getElementById('task-list');

    taskList.addEventListener('dragover', allowDrop);
    taskList.addEventListener('drop', drop);

    const taskItems = taskList.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        item.addEventListener('dragstart', drag);
    });
}

// Task Reminders
function scheduleReminder(reminderTime, taskTitle) {
    const reminderDate = new Date(reminderTime);
    const now = new Date();
    const delay = reminderDate - now;

    if (delay > 0) {
        setTimeout(() => {
            new Notification('Task Reminder', {
                body: `Reminder for task: ${taskTitle}`
            });
        }, delay);
    }
}

// Request notification permission on load
document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    loadContent('view-tasks');

    // Event listeners for navigation
    document.getElementById('view-tasks').addEventListener('click', () => loadContent('view-tasks'));
    document.getElementById('add-task').addEventListener('click', () => loadContent('add-task'));
});

