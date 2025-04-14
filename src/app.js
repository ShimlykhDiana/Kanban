/* ================== app.js ================== */

// 1) Helper to read tasks for the current user
function loadUserTasks(login) {
  const tasksJson = localStorage.getItem(`tasks_${login}`);
  if (!tasksJson) return [];
  return JSON.parse(tasksJson);
}
// 2) Helper to save tasks for the current user
function saveUserTasks(login, tasks) {
  localStorage.setItem(`tasks_${login}`, JSON.stringify(tasks));
}

// same code as before for updateFooterCounters, except it uses tasks from loadUserTasks
function updateFooterCounters() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) return;
  const tasks = loadUserTasks(currentUser.login);

  // let activeCount = tasks.filter(t => t.status !== "Finished").length;
  // or strictly backlog
  const activeCount = tasks.filter(t => t.status !== "Finished").length;
  const finishedCount = tasks.filter(t => t.status === "Finished").length;

  const activeEl = document.querySelector(".app-footer-active");
  const finishedEl = document.querySelector(".app-footer-finished");
  if (activeEl) activeEl.textContent = `Active tasks: ${activeCount}`;
  if (finishedEl) finishedEl.textContent = `Finished tasks: ${finishedCount}`;
}

function deleteTask(taskId) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) return;
  let tasks = loadUserTasks(currentUser.login);

  tasks = tasks.filter(t => t.id !== taskId);
  saveUserTasks(currentUser.login, tasks);
  renderBoard();
}

function renderBoard() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) return;

  const login = currentUser.login;
  const tasks = loadUserTasks(login);

  const backlogLane = document.getElementById("backlog-lane");
  const readyLane = document.getElementById("ready-lane");
  const inProgressLane = document.getElementById("inProgress-lane");
  const finishedLane = document.getElementById("finished-lane");
  if (!backlogLane || !readyLane || !inProgressLane || !finishedLane) return;

  function getTasksContainer(laneEl) {
    let container = laneEl.querySelector(".tasks-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "tasks-container";
      const header = laneEl.querySelector("h3");
      if (header) header.insertAdjacentElement("afterend", container);
    } else {
      container.innerHTML = "";
    }
    return container;
  }

  const backlogContainer = getTasksContainer(backlogLane);
  const readyContainer = getTasksContainer(readyLane);
  const inProgressContainer = getTasksContainer(inProgressLane);
  const finishedContainer = getTasksContainer(finishedLane);

  tasks.forEach(task => {
    const taskEl = document.createElement("div");
    taskEl.className = "task";
    taskEl.textContent = task.title;
    taskEl.draggable = true;
    // optional italic example styling
    if (task.example) {
      taskEl.style.color = "#666";
      taskEl.style.fontStyle = "italic";
    }

    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = "×";
    deleteBtn.style.marginLeft = "8px";
    deleteBtn.style.color = "#c00";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.float = "right";
    deleteBtn.style.fontWeight = "bold";
    deleteBtn.addEventListener("click", () => {
      deleteTask(task.id);
    });
    taskEl.appendChild(deleteBtn);

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

  setupDragAndDropListeners();
  updateFooterCounters();
  updateAddCardButtons(); 
}

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

function moveTaskToStatus(taskId, newStatus) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) return;
  const login = currentUser.login;
  const tasks = loadUserTasks(login);

  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = newStatus;
    saveUserTasks(login, tasks);
  }
}

function removeExampleTasks() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) return;
  const login = currentUser.login;
  let tasks = loadUserTasks(login);
  tasks = tasks.filter(t => !t.example);
  saveUserTasks(login, tasks);
}

/**
 * Setup backlog: "Click +Add card => show input => Submit"
 * We'll createBacklogTask() by storing tasks in tasks_<login>.
 */
function setupBacklogColumnListeners() {
  const backlogAddButton = document.getElementById("backlogAddButton");
  const backlogLane = document.getElementById("backlog-lane");
  if (!backlogAddButton || !backlogLane) return;

  let isAdding = false;
  let inputEl;
  let tasksContainer;

  backlogAddButton.addEventListener("click", () => {
    if (!isAdding) {
      isAdding = true;
      backlogAddButton.textContent = "Submit";
      tasksContainer = backlogLane.querySelector(".tasks-container");
      if (!tasksContainer) return;
      inputEl = document.createElement("input");
      inputEl.type = "text";
      inputEl.placeholder = "Enter your new task";
      inputEl.style.display = "block";
      inputEl.style.width = "100%";
      inputEl.style.marginTop = "6px";
      tasksContainer.appendChild(inputEl);
      inputEl.focus();
      inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addNewBacklogTask();
        }
      });
    } else {
      addNewBacklogTask();
    }
  });

  function addNewBacklogTask() {
    if (!isAdding || !inputEl) return;
    const title = inputEl.value.trim();
    if (title) {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser) {
        // load tasks, check duplicate, push new, save
        const login = currentUser.login;
        let tasks = loadUserTasks(login);
        const duplicate = tasks.some(t => t.title === title && t.status === "Backlog");
        if (!duplicate) {
          // create the backlog task
          tasks.push({
            id: uuid(),  // or import {v4 as uuid} from "uuid"
            title,
            status: "Backlog"
          });
          saveUserTasks(login, tasks);
          removeExampleTasks(); // remove seeded example tasks
          renderBoard();
        }
      }
    }
    inputEl.remove();
    backlogAddButton.textContent = "+ Add card";
    isAdding = false;
  }
}

// user menu, admin manage, etc. same as before
function insertUserMenu(username, role) {
  // ...
}
function showManageUsersUI() {
  // ...
}
function deleteUser(login) {
  // ...
}
function addNewUser(login, password, role) {
  // ...
}

// The rest of your login vs board logic
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./styles/style.css";

import { getFromStorage, generateTestUser } from "./utils.js";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import { User } from "./models/User";
import { State } from "./state";
import { authUser } from "./services/auth";
// we do not rely on "createBacklogTask" from Task.js anymore, or we can adapt it
import { v4 as uuid } from "uuid"; // for generating IDs
import {
  setupReadyColumnListeners,
  setupInProgressColumnListeners,
  setupFinishedColumnListeners,
  updateAddCardButtons
} from "./models/dropdown.js";

export const appState = new State();
generateTestUser(User); // Possibly seeds a "test" user, but no localStorage.clear()

// optional: also ensure we have an admin
(function ensureAdminUser() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const adminExists = users.some(u => u.login === "admin");
  if (!adminExists) {
    users.push({
      id: "admin-123",
      login: "admin",
      password: "adminpass",
      role: "admin"
    });
    localStorage.setItem("users", JSON.stringify(users));
  }
})();

const storedTasks = JSON.parse(localStorage.getItem("tasks_default") || "[]");
if (storedTasks.length === 0) {
  // if you want a "default" for brand-new user or a "shared" default
  // but if each user has their own tasks, you might skip this
}

const existingUser = getFromStorage("user");
if (existingUser && existingUser.login) {
  insertUserMenu(existingUser.login, existingUser.role || "user");
  document.querySelector("#app-content").innerHTML = taskFieldTemplate;
  renderBoard();
  setupBacklogColumnListeners();
  setupReadyColumnListeners();
  setupInProgressColumnListeners();
  setupFinishedColumnListeners();
} else {
  const loginForm = document.querySelector("#app-login-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const login = formData.get("login");
    const password = formData.get("password");

    if (authUser(login, password)) {
      localStorage.setItem("user", JSON.stringify({
        login, 
        role: (login === "admin") ? "admin" : "user"
      }));
      insertUserMenu(login, (login === "admin") ? "admin" : "user");
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

document.querySelectorAll("a[href]").forEach(link => {
  link.addEventListener("click", (e) => e.preventDefault());
});

export { renderBoard };