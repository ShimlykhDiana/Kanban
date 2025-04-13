

// --- Helper Functions and Listeners ---
// Function to render the board by reading tasks from localStorage,
// creating task elements, and inserting them into their corresponding lanes.
function renderBoard() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Get or create a container for tasks in a lane.
  function getTasksContainer(laneElement) {
    let container = laneElement.querySelector(".tasks-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "tasks-container";
      const header = laneElement.querySelector("h3");
      header.insertAdjacentElement("afterend", container);
    } else {
      container.innerHTML = ""; // clear previous tasks
    }
    return container;
  }

  // Get lane elements by their IDs (as defined in taskField.html)
  const backlogLane = document.getElementById("backlog-lane");
  const readyLane = document.getElementById("ready-lane");
  const inProgressLane = document.getElementById("inProgress-lane");
  const finishedLane = document.getElementById("finished-lane");

  if (!backlogLane || !readyLane || !inProgressLane || !finishedLane) {
    console.error("Lane element(s) missing. Check taskField.html for correct IDs.");
    return;
  }

  const backlogContainer = getTasksContainer(backlogLane);
  const readyContainer = getTasksContainer(readyLane);
  const inProgressContainer = getTasksContainer(inProgressLane);
  const finishedContainer = getTasksContainer(finishedLane);

  // Render each task as a draggable element in its proper lane.
  tasks.forEach(task => {
    const taskEl = document.createElement("div");
    taskEl.className = "task";
    taskEl.textContent = task.title;
    taskEl.draggable = true;

    taskEl.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", task.id);
      taskEl.classList.add("is-dragging");
    });
    taskEl.addEventListener("dragend", () => {
      taskEl.classList.remove("is-dragging");
    });

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

  // Reattach drag-and-drop listeners in case lanes were re-rendered.
  setupDragAndDropListeners();
}

// Function to attach dragover, dragleave, and drop listeners to each lane.
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

// Function to update a task's status in localStorage.
function moveTaskToStatus(taskId, newStatus) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

// This function sets up event listeners in the Backlog column,
// enabling the "Add card" functionality with a toggle input.
function setupBacklogColumnListeners() {
  const toggleBtn = document.getElementById("toggleBacklogInputBtn");
  const inputContainer = document.getElementById("backlogInputContainer");
  const saveBtn = document.getElementById("saveBacklogTaskBtn");
  const inputField = document.getElementById("backlogNewTaskInput");

  if (!toggleBtn || !inputContainer || !saveBtn || !inputField) {
    console.warn("Backlog column elements not found.");
    return;
  }

  // Toggle the input container's visibility.
  toggleBtn.addEventListener("click", () => {
    inputContainer.classList.toggle("hidden");
  });

  // On "Submit", create a new task and re-render the board.
  saveBtn.addEventListener("click", () => {
    const title = inputField.value.trim();
    if (!title) return;
    createBacklogTask(title);
    inputField.value = "";
    inputContainer.classList.add("hidden");
    renderBoard();
  });
}

// End of helper functions

// --- Main Module Code ---



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

// Create global state and generate a test user.
export const appState = new State();
generateTestUser(User);

// Seed default tasks if none exist.
const storedTasks = getFromStorage("tasks");
if (storedTasks.length === 0) {
  const defaultTasks = [
    { id: "abc123", title: "Buy groceries", status: "Backlog" },
    { id: "xyz789", title: "Read 100 pages", status: "Ready" },
    { id: "lmn456", title: "Wash the dishes", status: "Finished" },
  ];
  localStorage.setItem("tasks", JSON.stringify(defaultTasks));
}

// Check if a user is already logged in.
const existingUser = getFromStorage("user"); // e.g., { login: "test", role: "user" }

if (existingUser && existingUser.login) {
  document.querySelector("#app-content").innerHTML = taskFieldTemplate;
  renderBoard();
  setupBacklogColumnListeners();
  setupReadyColumnListeners();
  setupInProgressColumnListeners();
  setupFinishedColumnListeners();
  setupDragAndDropListeners();
} else {
  // Attach login form event listener.
  const loginForm = document.querySelector("#app-login-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const login = formData.get("login");
    const password = formData.get("password");

    if (authUser(login, password)) {
      localStorage.setItem("user", JSON.stringify({ login, role: "user" }));
      document.querySelector("#app-content").innerHTML = taskFieldTemplate;
      renderBoard();
      setupBacklogColumnListeners();
      setupReadyColumnListeners();
      setupInProgressColumnListeners();
      setupFinishedColumnListeners();
      setupDragAndDropListeners();
    } else {
      document.querySelector("#app-content").innerHTML = noAccessTemplate;
    }
  });
}

// Optional: Prevent default link navigation for future SPA functionality.
const links = document.querySelectorAll("a[href]");
links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
  });
});

export { renderBoard };