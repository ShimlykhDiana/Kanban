import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";


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
  setupFinishedColumnListeners
} from "./models/dropdown.js";

export const appState = new State();
generateTestUser(User);

const storedTasks = getFromStorage("tasks");
if (storedTasks.length === 0) {
  const defaultTasks = [
    { id: "abc123", title: "Buy groceries", status: "Backlog" },
    { id: "xyz789", title: "Read 100 pages", status: "Ready" },
    { id: "lmn456", title: "Wash the dishes", status: "Finished" }
  ];
  localStorage.setItem("tasks", JSON.stringify(defaultTasks));
}

// Check if user is in localStorage
const existingUser = getFromStorage("user"); // e.g. { login: "test", role: "user" }

if (existingUser && existingUser.login) {
  // We have a user => skip login
  document.querySelector("#app-content").innerHTML = taskFieldTemplate;
  renderBoard();
  setupBacklogColumnListeners();
  setupReadyColumnListeners();
  setupInProgressColumnListeners();
  setupFinishedColumnListeners();
} else {
  // No user => show login form
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
    } else {
      document.querySelector("#app-content").innerHTML = noAccessTemplate;
    }
  });
}

// Optional link handling:
let links = document.querySelectorAll("a[href]");
links.forEach((link) => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    console.log("TODO: implement front-end routing if you want it.");
  });
});

function renderBoard() {
  // your existing code to place tasks in columns, etc.
}

function setupBacklogColumnListeners() {
  // your existing code to show/hide input for new backlog tasks
}

export { renderBoard };