const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const dueDate = document.getElementById("dueDate");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editTaskId = document.getElementById("editTaskId");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveTheme() {
  localStorage.setItem("darkMode", JSON.stringify(darkMode));
}

function applyTheme() {
  document.body.classList.toggle("dark", darkMode);
  themeToggle.textContent = darkMode ? "Light Mode" : "Dark Mode";
}

function formatDate(dateString) {
  if (!dateString) return "Not set";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString();
}

function formatDateTime(dateString) {
  if (!dateString) return "Not started";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not started";
  return date.toLocaleString();
}

function calculateDuration(startedAt, finishedAt) {
  if (!startedAt || !finishedAt) return "In progress";
  const diffMs = new Date(finishedAt) - new Date(startedAt);

  if (diffMs < 0) return "Invalid time";

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

function getStatusClass(status) {
  if (status === "pending") return "status-pending";
  if (status === "in-progress") return "status-progress";
  return "status-done";
}

function getStatusLabel(status) {
  if (status === "pending") return "Pending";
  if (status === "in-progress") return "In Progress";
  return "Done";
}

function getFilteredTasks() {
  if (currentFilter === "all") return tasks;
  return tasks.filter(task => task.status === currentFilter);
}

function clearForm() {
  taskTitle.value = "";
  taskDescription.value = "";
  dueDate.value = "";
  editTaskId.value = "";
  saveTaskBtn.textContent = "Save Task";
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = "";

  taskCount.textContent = `Total tasks: ${tasks.length} | Showing: ${filteredTasks.length}`;

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<div class="empty-state">No tasks found.</div>`;
    return;
  }

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-card";

    li.innerHTML = `
      <div class="task-header">
        <div>
          <h3 class="task-title">${task.title}</h3>
        </div>
        <span class="status-badge ${getStatusClass(task.status)}">${getStatusLabel(task.status)}</span>
      </div>

      <div class="task-description">${task.description || "No description provided."}</div>

      <div class="task-meta">
        <div><strong>Due Date:</strong> ${formatDate(task.dueDate)}</div>
        <div><strong>Started At:</strong> ${formatDateTime(task.startedAt)}</div>
        <div><strong>Finished At:</strong> ${task.finishedAt ? formatDateTime(task.finishedAt) : "Not finished"}</div>
        <div><strong>Time Taken:</strong> ${calculateDuration(task.startedAt, task.finishedAt)}</div>
        <div><strong>Last Updated:</strong> ${formatDateTime(task.updatedAt)}</div>
      </div>

      <div class="task-actions">
        <button class="edit-btn" data-id="${task.id}">Edit</button>
        <button class="start-btn" data-id="${task.id}">Start</button>
        <button class="done-btn" data-id="${task.id}">Finish</button>
        <button class="delete-btn" data-id="${task.id}">Delete</button>
      </div>
    `;

    taskList.appendChild(li);
  });

  addActionListeners();
}

function addTask() {
  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  const due = dueDate.value;

  if (!title) {
    alert("Please enter a task title.");
    return;
  }

  const now = new Date().toISOString();
  const existingId = editTaskId.value;

  if (existingId) {
    const task = tasks.find(t => t.id === existingId);
    if (task) {
      task.title = title;
      task.description = description;
      task.dueDate = due;
      task.updatedAt = now;
    }
  } else {
    tasks.push({
      id: crypto.randomUUID(),
      title: title,
      description: description,
      dueDate: due,
      status: "pending",
      startedAt: null,
      finishedAt: null,
      createdAt: now,
      updatedAt: now
    });
  }

  saveTasks();
  clearForm();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  taskTitle.value = task.title;
  taskDescription.value = task.description;
  dueDate.value = task.dueDate || "";
  editTaskId.value = task.id;
  saveTaskBtn.textContent = "Update Task";
}

function startTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  if (!task.startedAt) {
    task.startedAt = new Date().toISOString();
  }

  task.status = "in-progress";
  task.updatedAt = new Date().toISOString();

  saveTasks();
  renderTasks();
}

function finishTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  if (!task.startedAt) {
    task.startedAt = new Date().toISOString();
  }

  task.finishedAt = new Date().toISOString();
  task.status = "done";
  task.updatedAt = new Date().toISOString();

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function addActionListeners() {
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", () => editTask(button.dataset.id));
  });

  document.querySelectorAll(".start-btn").forEach(button => {
    button.addEventListener("click", () => startTask(button.dataset.id));
  });

  document.querySelectorAll(".done-btn").forEach(button => {
    button.addEventListener("click", () => finishTask(button.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", () => deleteTask(button.dataset.id));
  });
}

saveTaskBtn.addEventListener("click", addTask);

cancelEditBtn.addEventListener("click", () => {
  clearForm();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    renderTasks();
  });
});

themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  saveTheme();
  applyTheme();
});

setInterval(() => {
  renderTasks();
}, 1000);

applyTheme();
renderTasks();