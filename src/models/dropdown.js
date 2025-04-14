import { moveTaskToReady, moveTaskToInProgress, moveTaskToFinished } from "./Task.js";
import { renderBoard } from "../app.js";

/** 
 * For Ready => gather tasks from Backlog, show them in <ul> on button click
 */
export function setupReadyColumnListeners() {
  const addCardReadyBtn = document.getElementById("addCardReadyBtn");
  const readyDropdown = document.getElementById("readyDropdown");
  if (!addCardReadyBtn || !readyDropdown) return;

  addCardReadyBtn.addEventListener("click", () => {
    if (readyDropdown.classList.contains("show")) {
      readyDropdown.classList.remove("show");
      return;
    }
    populateReadyDropdown();
    readyDropdown.classList.add("show");
  });

  readyDropdown.addEventListener("click", (e) => {
    if (e.target && e.target.matches("li")) {
      const taskId = e.target.dataset.id;
      moveTaskToReady(taskId);
      readyDropdown.classList.remove("show");
      renderBoard();
    }
  });
}

function populateReadyDropdown() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const backlogTasks = tasks.filter(t => t.status === "Backlog");

  const readyDropdown = document.getElementById("readyDropdown");
  readyDropdown.innerHTML = "";

  backlogTasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.title;
    li.dataset.id = task.id;
    readyDropdown.appendChild(li);
  });
}


/** 
 * For In progress => gather tasks from Ready
 */
export function setupInProgressColumnListeners() {
  const addCardInProgressBtn = document.getElementById("addCardInProgressBtn");
  const inProgressDropdown = document.getElementById("inProgressDropdown");
  if (!addCardInProgressBtn || !inProgressDropdown) return;

  addCardInProgressBtn.addEventListener("click", () => {
    if (inProgressDropdown.classList.contains("show")) {
      inProgressDropdown.classList.remove("show");
      return;
    }
    populateInProgressDropdown();
    inProgressDropdown.classList.add("show");
  });

  inProgressDropdown.addEventListener("click", (e) => {
    if (e.target && e.target.matches("li")) {
      const taskId = e.target.dataset.id;
      moveTaskToInProgress(taskId);
      inProgressDropdown.classList.remove("show");
      renderBoard();
    }
  });
}

function populateInProgressDropdown() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const readyTasks = tasks.filter(t => t.status === "Ready");

  const inProgressDropdown = document.getElementById("inProgressDropdown");
  inProgressDropdown.innerHTML = "";

  readyTasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.title;
    li.dataset.id = task.id;
    inProgressDropdown.appendChild(li);
  });
}


/** 
 * For Finished => gather tasks from In progress
 */
export function setupFinishedColumnListeners() {
  const addCardFinishedBtn = document.getElementById("addCardFinishedBtn");
  const finishedDropdown = document.getElementById("finishedDropdown");
  if (!addCardFinishedBtn || !finishedDropdown) return;

  addCardFinishedBtn.addEventListener("click", () => {
    if (finishedDropdown.classList.contains("show")) {
      finishedDropdown.classList.remove("show");
      return;
    }
    populateFinishedDropdown();
    finishedDropdown.classList.add("show");
  });

  finishedDropdown.addEventListener("click", (e) => {
    if (e.target && e.target.matches("li")) {
      const taskId = e.target.dataset.id;
      moveTaskToFinished(taskId);
      finishedDropdown.classList.remove("show");
      renderBoard();
    }
  });
}

function populateFinishedDropdown() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const inProgressTasks = tasks.filter(t => t.status === "In progress");

  const finishedDropdown = document.getElementById("finishedDropdown");
  finishedDropdown.innerHTML = "";

  inProgressTasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.title;
    li.dataset.id = task.id;
    finishedDropdown.appendChild(li);
  });
}

/**
 * Enable or disable the "Add card" buttons in Ready, InProgress, Finished.
 */
export function updateAddCardButtons() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Ready is disabled if no tasks in Backlog
  const backlogCount = tasks.filter(t => t.status === "Backlog").length;
  const addCardReadyBtn = document.getElementById("addCardReadyBtn");
  if (addCardReadyBtn) addCardReadyBtn.disabled = (backlogCount === 0);

  // InProgress is disabled if no tasks in Ready
  const readyCount = tasks.filter(t => t.status === "Ready").length;
  const addCardInProgressBtn = document.getElementById("addCardInProgressBtn");
  if (addCardInProgressBtn) addCardInProgressBtn.disabled = (readyCount === 0);

  // Finished is disabled if no tasks in In progress
  const inProgressCount = tasks.filter(t => t.status === "In progress").length;
  const addCardFinishedBtn = document.getElementById("addCardFinishedBtn");
  if (addCardFinishedBtn) addCardFinishedBtn.disabled = (inProgressCount === 0);
}