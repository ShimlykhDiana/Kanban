// src/models/dropdown.js
import {
  moveTaskToReady,
  moveTaskToInProgress,
  moveTaskToFinished
} from "./Task.js";
import { renderBoard } from "../app.js";

/**
 * Moves tasks from Backlog → Ready
 */
export function setupReadyColumnListeners() {
  const addCardReadyBtn = document.getElementById("addCardReady");
  const readyDropdown = document.getElementById("readyDropdown");

  if (!addCardReadyBtn || !readyDropdown) return;

  addCardReadyBtn.addEventListener("click", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const backlogTasks = tasks.filter(t => t.status === "Backlog");

    if (backlogTasks.length === 0) return;

    readyDropdown.innerHTML = "";
    readyDropdown.classList.toggle("hidden");

    backlogTasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = task.title;
      li.addEventListener("click", () => {
        moveTaskToReady(task.id);
        readyDropdown.classList.add("hidden");
        renderBoard(); // refresh board
      });
      readyDropdown.appendChild(li);
    });
  });
}

/**
 * Moves tasks from Ready → In progress
 */
export function setupInProgressColumnListeners() {
  const addCardInProgressBtn = document.getElementById("addCardInProgress");
  const inProgressDropdown = document.getElementById("inProgressDropdown");

  if (!addCardInProgressBtn || !inProgressDropdown) return;

  addCardInProgressBtn.addEventListener("click", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const readyTasks = tasks.filter(t => t.status === "Ready");

    if (readyTasks.length === 0) return;

    inProgressDropdown.innerHTML = "";
    inProgressDropdown.classList.toggle("hidden");

    readyTasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = task.title;
      li.addEventListener("click", () => {
        moveTaskToInProgress(task.id);
        inProgressDropdown.classList.add("hidden");
        renderBoard();
      });
      inProgressDropdown.appendChild(li);
    });
  });
}

/**
 * Moves tasks from In progress → Finished
 */
export function setupFinishedColumnListeners() {
  const addCardFinishedBtn = document.getElementById("addCardFinished");
  const finishedDropdown = document.getElementById("finishedDropdown");

  if (!addCardFinishedBtn || !finishedDropdown) return;

  addCardFinishedBtn.addEventListener("click", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const inProgressTasks = tasks.filter(t => t.status === "In progress");

    if (inProgressTasks.length === 0) return;

    finishedDropdown.innerHTML = "";
    finishedDropdown.classList.toggle("hidden");

    inProgressTasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = task.title;
      li.addEventListener("click", () => {
        moveTaskToFinished(task.id);
        finishedDropdown.classList.add("hidden");
        renderBoard();
      });
      finishedDropdown.appendChild(li);
    });
  });
}