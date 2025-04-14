/* ------------------------------------------------------------------
   1) Helper Functions for Board & Footer
--------------------------------------------------------------------- */
function updateFooterCounters() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  // For "Active tasks": if you want strictly Backlog, uncomment next line.
  // const activeCount = tasks.filter(t => t.status === "Backlog").length;
  const activeCount = tasks.filter(t => t.status !== "Finished").length;
  const finishedCount = tasks.filter(t => t.status === "Finished").length;

  const activeEl = document.querySelector(".app-footer-active");
  const finishedEl = document.querySelector(".app-footer-finished");

  if (activeEl) activeEl.textContent = `Active tasks: ${activeCount}`;
  if (finishedEl) finishedEl.textContent = `Finished tasks: ${finishedCount}`;
}

/**
 * deleteTask(taskId)
 * Removes the specified task from localStorage, then calls renderBoard().
 */
function deleteTask(taskId) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter((t) => t.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderBoard();
}

/**
 * renderBoard()
 * Reads tasks from localStorage, places them in the correct lane,
 * creates task elements with a small delete "×" button,
 * sets up drag/drop, updates counters, and refreshes "Add card" button states.
 */
function renderBoard() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const backlogLane = document.getElementById("backlog-lane");
  const readyLane = document.getElementById("ready-lane");
  const inProgressLane = document.getElementById("inProgress-lane");
  const finishedLane = document.getElementById("finished-lane");

  if (!backlogLane || !readyLane || !inProgressLane || !finishedLane) {
    console.error("Some lane elements not found. Check your HTML IDs.");
    return;
  }

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

  const backlogContainer    = getTasksContainer(backlogLane);
  const readyContainer      = getTasksContainer(readyLane);
  const inProgressContainer = getTasksContainer(inProgressLane);
  const finishedContainer   = getTasksContainer(finishedLane);

  tasks.forEach(task => {
    const taskEl = document.createElement("div");
    taskEl.className = "task";
    taskEl.textContent = task.title;
    taskEl.draggable = true;

    if (task.example) {
      taskEl.style.color = "#666";
      taskEl.style.fontStyle = "italic";
    }

    // Add a small delete button "×"
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

/**
 * setupDragAndDropListeners(): Enables drag events on lanes.
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
 * moveTaskToStatus(taskId, newStatus): Updates a task’s status in localStorage.
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
 * removeExampleTasks(): Filters out tasks with example:true.
 */
function removeExampleTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter((t) => !t.example);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ------------------------------------------------------------------
   2) Setup Backlog Column:
   "Click + Add card" shows an inline input field and changes button text to "Submit".
   Submission is triggered only by Enter key or button click.
   (The blur event is removed to avoid duplicates.)
--------------------------------------------------------------------- */
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
      // Check for duplicates: if a Backlog task with the same title exists, don’t add it.
      const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      const duplicate = tasks.some(t => t.title === title && t.status === "Backlog");
      if (!duplicate) {
        createBacklogTask(title);
        removeExampleTasks();
      }
      renderBoard();
    }
    inputEl.remove();
    backlogAddButton.textContent = "+ Add card";
    isAdding = false;
  }
}

/* ------------------------------------------------------------------
   3) Insert User Menu (Burger + Avatar)
   This replaces the login form area with a menu that shows:
   - Burger icon + avatar
   - On click, shows a dropdown with "Hello, username", "My account", "My tasks",
     "Manage users" (if admin), and "Log out".
--------------------------------------------------------------------- */
function insertUserMenu(username, role) {
  const navRight = document.getElementById("nav-right");
  if (!navRight) return;

  navRight.innerHTML = `
    <div class="user-menu" id="userMenu">
      <div class="user-menu-burger" id="userMenuBurger">
        <div class="burger-line"></div>
        <div class="burger-line"></div>
        <div class="burger-line"></div>
      </div>
      <div class="user-menu-avatar"></div>
    </div>
    <ul class="user-dropdown" id="userDropdown">
      <li class="user-menu-username">Hello, ${username}</li>
      <li>My account</li>
      <li>My tasks</li>
      ${role === "admin" ? `<li id="manageUsersOption">Manage users</li>` : ""}
      <li id="logoutOption">Log out</li>
    </ul>
  `;

  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const logoutOption = document.getElementById("logoutOption");
  const manageUsersOption = document.getElementById("manageUsersOption");

  let menuOpen = false;
  userMenu.addEventListener("click", () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      userDropdown.classList.add("show");
    } else {
      userDropdown.classList.remove("show");
    }
  });

  if (logoutOption) {
    logoutOption.addEventListener("click", () => {
      localStorage.removeItem("user");
      location.reload();
    });
  }

  if (manageUsersOption) {
    manageUsersOption.addEventListener("click", () => {
      userDropdown.classList.remove("show");
      showManageUsersUI();
    });
  }
}

/* ------------------------------------------------------------------
   4) Admin: Manage Users UI – for adding/deleting users (only if admin)
--------------------------------------------------------------------- */
function showManageUsersUI() {
  const appContent = document.getElementById("app-content");
  if (!appContent) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  let html = `
    <h2>Manage Users (Admin Only)</h2>
    <div id="usersList">
      <ul>
        ${users.map(u => `
          <li>
            ${u.login} [role: ${u.role}] 
            <button class="deleteUserBtn" data-login="${u.login}">Delete</button>
          </li>`).join("")}
      </ul>
    </div>
    <hr />
    <div id="addUserForm">
      <h3>Add a new user</h3>
      <input type="text" id="newUserLogin" placeholder="login" />
      <input type="text" id="newUserPassword" placeholder="password" />
      <select id="newUserRole">
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <button id="createUserBtn">Create User</button>
    </div>
    <hr />
    <button id="backToBoardBtn">Back to Board</button>
  `;
  appContent.innerHTML = html;

  const deleteBtns = document.querySelectorAll(".deleteUserBtn");
  deleteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const loginToDelete = btn.dataset.login;
      deleteUser(loginToDelete);
    });
  });

  const createUserBtn = document.getElementById("createUserBtn");
  if (createUserBtn) {
    createUserBtn.addEventListener("click", () => {
      const login = document.getElementById("newUserLogin").value.trim();
      const password = document.getElementById("newUserPassword").value.trim();
      const role = document.getElementById("newUserRole").value;
      if (login && password) {
        addNewUser(login, password, role);
      }
    });
  }

  const backToBoardBtn = document.getElementById("backToBoardBtn");
  backToBoardBtn.addEventListener("click", () => {
    appContent.innerHTML = taskFieldTemplate;
    renderBoard();
    setupBacklogColumnListeners();
    setupReadyColumnListeners();
    setupInProgressColumnListeners();
    setupFinishedColumnListeners();
  });
}

function deleteUser(login) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(u => u.login !== login);
  localStorage.setItem("users", JSON.stringify(users));
  showManageUsersUI();
}

function addNewUser(login, password, role) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const existing = users.find(u => u.login === login);
  if (existing) {
    alert("User with that login already exists!");
    return;
  }
  users.push({ 
    id: "user-" + Date.now(), 
    login, 
    password, 
    role 
  });
  localStorage.setItem("users", JSON.stringify(users));
  showManageUsersUI();
}

/* ------------------------------------------------------------------
   5) Final Code: Login vs. Board Setup
--------------------------------------------------------------------- */
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
  updateAddCardButtons
} from "./models/dropdown.js";

export const appState = new State();
generateTestUser(User);

// Ensure admin user exists in storage (update generateTestUser in utils.js for admin support)
// For testing, if you want to seed an admin, do:
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

// Seed example tasks if none exist
const storedTasks = getFromStorage("tasks");
if (storedTasks.length === 0) {
  const defaultTasks = [
    { id: "abc123", title: "Buy groceries", status: "Backlog", example: true },
    { id: "xyz789", title: "Read 100 pages", status: "Ready", example: true },
    { id: "lmn456", title: "Wash the dishes", status: "Finished", example: true },
  ];
  localStorage.setItem("tasks", JSON.stringify(defaultTasks));
}

// Check if a user is in localStorage
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
      localStorage.setItem("user", JSON.stringify({ login, role: login === "admin" ? "admin" : "user" }));
      insertUserMenu(login, login === "admin" ? "admin" : "user");
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

// Optional: block normal <a> navigation
document.querySelectorAll("a[href]").forEach(link => {
  link.addEventListener("click", (e) => e.preventDefault());
});

export { renderBoard };