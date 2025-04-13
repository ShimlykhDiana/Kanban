/* ------------------------------------------------------------------
   1) Helper Functions for Board & Footer
--------------------------------------------------------------------- */
function updateFooterCounters() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const activeCount = tasks.filter(t => t.status !== "Finished").length;
  const finishedCount = tasks.filter(t => t.status === "Finished").length;

  const activeEl = document.querySelector(".app-footer-active");
  const finishedEl = document.querySelector(".app-footer-finished");

  if (activeEl) activeEl.textContent = `Active tasks: ${activeCount}`;
  if (finishedEl) finishedEl.textContent = `Finished tasks: ${finishedCount}`;
}

function renderBoard() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // 1) Get lane elements
  const backlogLane = document.getElementById("backlog-lane");
  const readyLane = document.getElementById("ready-lane");
  const inProgressLane = document.getElementById("inProgress-lane");
  const finishedLane = document.getElementById("finished-lane");

  if (!backlogLane || !readyLane || !inProgressLane || !finishedLane) {
    console.error("Some lane elements not found. Check your HTML IDs.");
    return;
  }

  // 2) For each lane, get or create a .tasks-container and clear it
  function getTasksContainer(laneEl) {
    let container = laneEl.querySelector(".tasks-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "tasks-container";
      // place it right after the <h3>
      const header = laneEl.querySelector("h3");
      if (header) header.insertAdjacentElement("afterend", container);
    } else {
      container.innerHTML = ""; // empty previous tasks
    }
    return container;
  }

  const backlogContainer    = getTasksContainer(backlogLane);
  const readyContainer      = getTasksContainer(readyLane);
  const inProgressContainer = getTasksContainer(inProgressLane);
  const finishedContainer   = getTasksContainer(finishedLane);

  // 3) Create a .task element for each item in localStorage
  tasks.forEach(task => {
    const taskEl = document.createElement("div");
    taskEl.className = "task";
    taskEl.textContent = task.title;
    taskEl.draggable = true;

    // If we have example tasks, style them in italics
    if (task.example) {
      taskEl.style.color = "#666";
      taskEl.style.fontStyle = "italic";
    }

    // dragstart
    taskEl.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", task.id);
      taskEl.classList.add("is-dragging");
    });
    // dragend
    taskEl.addEventListener("dragend", () => {
      taskEl.classList.remove("is-dragging");
    });

    // Place the task in the correct container based on its .status
    if (task.status === "Backlog") {
      backlogContainer.appendChild(taskEl);
    } else if (task.status === "Ready") {
      readyContainer.appendChild(taskEl);
    } else if (task.status === "In progress") {
      inProgressContainer.appendChild(taskEl);
    } else if (task.status === "Finished") {
      finishedContainer.appendChild(taskEl);
    }
  });

  // 4) Set up drag & drop (if you have it)
  setupDragAndDropListeners();

  // 5) Update counters in footer
  updateFooterCounters();
}

/**
 * For dragging tasks between columns.
 */
function setupDragAndDropListeners() {
  const lanes = document.querySelectorAll(".swim-lanes");
  lanes.forEach(lane => {
    lane.addEventListener("dragover", (e) => {
      e.preventDefault();
      lane.classList.add("drag-over");
    });
    lane.addEventListener("dragleave", () => {
      lane.classList.remove("drag-over");
    });
    lane.addEventListener("drop", (e) => {
      e.preventDefault();
      lane.classList.remove("drag-over");
      const taskId = e.dataTransfer.getData("text/plain");
      let newStatus = "";
      if (lane.id === "backlog-lane") newStatus = "Backlog";
      else if (lane.id === "ready-lane") newStatus = "Ready";
      else if (lane.id === "inProgress-lane") newStatus = "In progress";
      else if (lane.id === "finished-lane") newStatus = "Finished";

      if (taskId && newStatus) {
        moveTaskToStatus(taskId, newStatus);
        renderBoard();
      }
    });
  });
}

/**
 * Move a task from any status to newStatus in localStorage.
 */
function moveTaskToStatus(taskId, newStatus) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

/**
 * Setup the backlog column => new tasks by clicking or pressing Enter.
 */
function setupBacklogColumnListeners() {
  const toggleBtn     = document.getElementById("toggleBacklogInputBtn");
  const inputContainer= document.getElementById("backlogInputContainer");
  const saveBtn       = document.getElementById("saveBacklogTaskBtn");
  const inputField    = document.getElementById("backlogNewTaskInput");

  if (!toggleBtn || !inputContainer || !saveBtn || !inputField) {
    console.warn("Backlog elements not found.");
    return;
  }

  toggleBtn.addEventListener("click", () => {
    inputContainer.classList.toggle("hidden");
    if (!inputContainer.classList.contains("hidden")) {
      inputField.focus();
    }
  });

  // press Enter => create new backlog task
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNewBacklogTask();
    }
  });

  saveBtn.addEventListener("click", () => {
    addNewBacklogTask();
  });

  function addNewBacklogTask() {
    const title = inputField.value.trim();
    if (!title) return;
    // createBacklogTask => your function that sets {title, status:'Backlog'} in localStorage
    createBacklogTask(title);

    // Remove the example tasks (with example:true) once the user adds a real one
    removeExampleTasks();

    inputField.value = "";
    inputContainer.classList.add("hidden");
    renderBoard();
  }
}

/**
 * removeExampleTasks()
 * Filters out tasks with example:true from localStorage.
 */
function removeExampleTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter((t) => !t.example);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Insert "Hello, user + Logout" in place of the login form.
 */
function insertLogoutButton(username) {
  const loginFormEl = document.querySelector("#app-login-form");
  if (loginFormEl) {
    loginFormEl.parentNode.innerHTML = `
      <span style="color: white; margin-right: 8px;">
        Hello, ${username}!
      </span>
      <button id="logoutBtn" class="btn btn-outline-light small-btn">Logout</button>
    `;
  }
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "logoutBtn") {
      localStorage.removeItem("user");
      location.reload();
    }
  });
}

// --- IMPORTS & MAIN LOGIC ---
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./styles/style.css";

import { getFromStorage, generateTestUser } from "./utils.js";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import { User } from "./models/User";
import { State } from "./state";
import { authUser } from "./services/auth";
import { createBacklogTask } from "./models/Task.js";  
import {
  setupReadyColumnListeners,
  setupInProgressColumnListeners,
  setupFinishedColumnListeners,
} from "./models/dropdown.js";

export const appState = new State();
generateTestUser(User);

// Possibly seed example tasks if none exist
const storedTasks = getFromStorage("tasks");
if (storedTasks.length === 0) {
  const defaultTasks = [
    { id: "abc123", title: "Buy groceries", status: "Backlog", example: true },
    { id: "xyz789", title: "Read 100 pages", status: "Ready", example: true },
    { id: "lmn456", title: "Wash the dishes", status: "Finished", example: true },
  ];
  localStorage.setItem("tasks", JSON.stringify(defaultTasks));
}

// Check if user is in localStorage
const existingUser = getFromStorage("user");

// If user is logged in => show board
if (existingUser && existingUser.login) {
  insertLogoutButton(existingUser.login);
  document.querySelector("#app-content").innerHTML = taskFieldTemplate;
  renderBoard();
  setupBacklogColumnListeners();
  setupReadyColumnListeners();
  setupInProgressColumnListeners();
  setupFinishedColumnListeners();

// else => show login form
} else {
  const loginForm = document.querySelector("#app-login-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const login = formData.get("login");
    const password = formData.get("password");

    if (authUser(login, password)) {
      localStorage.setItem("user", JSON.stringify({ login, role: "user" }));
      insertLogoutButton(login);

      document.querySelector("#app-content").innerHTML = taskFieldTemplate;
      renderBoard();
      setupBacklogColumnListeners();
      setupReadyColumnListeners();
      setupInProgressColumnListeners();
      setupFinishedColumnListeners();
    } else {
      document.querySelector("#app-content").innerHTML = noAccessTemplate;
    }
  });
}

// optional block normal links
document.querySelectorAll("a[href]").forEach(link => {
  link.addEventListener("click", (e) => e.preventDefault());
});

// END
export { renderBoard };