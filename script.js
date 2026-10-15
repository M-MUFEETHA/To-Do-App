const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDate');
const priorityInput = document.getElementById('priority');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const clearBtn = document.getElementById('clearBtn');
const filters = document.querySelectorAll('.filter');

let tasks = [];
let currentFilter = 'all';

try {
  tasks = JSON.parse(localStorage.getItem('colorfulTodoTasks') || '[]');
} catch {
  tasks = [];
}

function saveTasks() {
  localStorage.setItem('colorfulTodoTasks', JSON.stringify(tasks));
}

function formatDate(dateString) {
  if (!dateString) return 'No due date';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderTasks() {
  taskList.innerHTML = '';
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === 'pending') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  emptyState.hidden = visibleTasks.length !== 0;
  visibleTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task ${task.completed ? 'done' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'check';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.title} completed`);
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const content = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;

    const meta = document.createElement('div');
    meta.className = 'meta';
    const date = document.createElement('span');
    date.textContent = `📅 ${formatDate(task.dueDate)}`;
    const priority = document.createElement('span');
    priority.className = `priority ${task.priority}`;
    priority.textContent = task.priority;
    meta.append(date, priority);
    content.append(title, meta);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const edit = document.createElement('button');
    edit.className = 'icon-btn edit-btn';
    edit.type = 'button';
    edit.textContent = '✏️';
    edit.title = 'Edit task';
    edit.setAttribute('aria-label', `Edit ${task.title}`);
    edit.addEventListener('click', () => {
      const updated = prompt('Edit your task:', task.title);
      if (updated === null) return;
      if (!updated.trim()) {
        alert('Task cannot be empty.');
        return;
      }
      task.title = updated.trim();
      saveTasks();
      renderTasks();
    });

    const del = document.createElement('button');
    del.className = 'icon-btn delete-btn';
    del.type = 'button';
    del.textContent = '🗑';
    del.title = 'Delete task';
    del.setAttribute('aria-label', `Delete ${task.title}`);
    del.addEventListener('click', () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });
    actions.append(edit, del);
    li.append(checkbox, content, actions);
    taskList.append(li);
  });

  document.getElementById('totalCount').textContent = tasks.length;
  document.getElementById('completedCount').textContent = tasks.filter(task => task.completed).length;
  document.getElementById('pendingCount').textContent = tasks.filter(task => !task.completed).length;
}

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  tasks.unshift({
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    title,
    dueDate: dueDateInput.value,
    priority: priorityInput.value,
    completed: false
  });
  saveTasks();
  renderTasks();
  taskForm.reset();
  priorityInput.value = 'Medium';
  taskInput.focus();
});

filters.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filters.forEach(filter => filter.classList.toggle('active', filter === button));
    renderTasks();
  });
});

clearBtn.addEventListener('click', () => {
  if (tasks.length === 0) return;
  if (confirm('Delete all tasks? This cannot be undone.')) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

renderTasks();
