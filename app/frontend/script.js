const apiUrl = "/api/tasks";
const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskStatus = document.getElementById("task-status");
const taskPriority = document.getElementById("task-priority");
const taskHours = document.getElementById("task-hours");
const taskDueDate = document.getElementById("task-due-date");
const taskOwner = document.getElementById("task-owner");
const taskSubmit = document.getElementById("task-submit");
const taskDetail = document.getElementById("task-detail");
const detailBadge = document.getElementById("detail-badge");
const taskCount = document.getElementById("task-count");
const resetFormButton = document.getElementById("reset-form");
let editingTaskId = null;
let selectedTaskId = null;

function resetForm() {
  taskForm.reset();
  taskHours.value = 1;
  taskStatus.value = "Pendiente";
  taskPriority.value = "Alta";
  editingTaskId = null;
  taskSubmit.textContent = "Guardar tarea";
}

function fillForm(task) {
  editingTaskId = task.id;
  taskTitle.value = task.title;
  taskDescription.value = task.description || "";
  taskStatus.value = task.status;
  taskPriority.value = task.priority;
  taskHours.value = task.estimated_hours;
  taskDueDate.value = task.due_date ? task.due_date.slice(0, 10) : "";
  taskOwner.value = task.owner_name || "";
  taskSubmit.textContent = "Actualizar tarea";
}

function renderTaskDetail(task) {
  if (!task) {
    detailBadge.textContent = "Sin seleccionar";
    taskDetail.className = "task-detail empty-state";
    taskDetail.textContent = "Elige una tarea del grid para ver todos sus datos y editarla.";
    return;
  }

  detailBadge.textContent = `Tarea #${task.id}`;
  taskDetail.className = "task-detail";
  taskDetail.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description || "Sin descripcion"}</p>
    <div class="detail-grid">
      <div class="detail-item"><span>Estado</span>${task.status}</div>
      <div class="detail-item"><span>Prioridad</span>${task.priority}</div>
      <div class="detail-item"><span>Horas</span>${task.estimated_hours}</div>
      <div class="detail-item"><span>Responsable</span>${task.owner_name || "Equipo"}</div>
      <div class="detail-item"><span>Fecha limite</span>${task.due_date ? task.due_date.slice(0, 10) : "Sin fecha"}</div>
    </div>
  `;
}

function getPayload() {
  return {
    title: taskTitle.value,
    description: taskDescription.value,
    status: taskStatus.value,
    priority: taskPriority.value,
    estimatedHours: Number(taskHours.value),
    dueDate: taskDueDate.value || null,
    ownerName: taskOwner.value || "Equipo"
  };
}

async function loadTasks() {
  const response = await fetch(apiUrl);
  const tasks = await response.json();

  taskList.innerHTML = "";
  taskCount.textContent = tasks.length;

  if (tasks.length === 0) {
    renderTaskDetail(null);
  }

  if (!selectedTaskId && tasks.length > 0) {
    selectedTaskId = tasks[0].id;
  }

  tasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = "task-card";
    if (task.id === selectedTaskId) {
      card.classList.add("is-selected");
      renderTaskDetail(task);
    }
    card.addEventListener("click", () => {
      selectedTaskId = task.id;
      renderTaskDetail(task);
      fillForm(task);
      loadTasks();
    });

    const title = document.createElement("h3");
    title.textContent = task.title;

    const description = document.createElement("p");
    description.textContent = task.description || "Sin descripcion";

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.innerHTML = `
      <span class="task-chip">${task.status}</span>
      <span class="task-chip">${task.priority}</span>
      <span class="task-chip">${task.estimated_hours} h</span>
    `;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.className = "secondary-button";
    editButton.textContent = "Abrir";
    editButton.addEventListener("click", () => {
      selectedTaskId = task.id;
      fillForm(task);
      renderTaskDetail(task);
      loadTasks();
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "danger-button";
    deleteButton.textContent = "Borrar";
    deleteButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await fetch(`${apiUrl}/${task.id}`, {
        method: "DELETE"
      });
      if (selectedTaskId === task.id) {
        selectedTaskId = null;
        resetForm();
      }
      await loadTasks();
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(meta);
    card.appendChild(actions);
    taskList.appendChild(card);
  });
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const method = editingTaskId ? "PUT" : "POST";
  const endpoint = editingTaskId ? `${apiUrl}/${editingTaskId}` : apiUrl;

  await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(getPayload())
  });

  resetForm();
  await loadTasks();
});

resetFormButton.addEventListener("click", () => {
  selectedTaskId = null;
  resetForm();
  renderTaskDetail(null);
  loadTasks();
});

resetForm();
loadTasks();
