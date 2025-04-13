// src/models/dropdown.js
import { moveTaskToReady, moveTaskToInProgress, moveTaskToFinished } from "./Task.js";
import { renderBoard } from "../app.js";

/** 
 * 1) Moves tasks from Backlog → Ready using a single <select> #addCardReady. 
 * 
 *   - On focus, we populate the <select> with tasks from "Backlog." 
 *   - On change, we move the selected task to "Ready," revert to + Add card display, and re-render.
 */
export function setupReadyColumnListeners() {
  const selectReady = document.getElementById("addCardReady");
  if (!selectReady) return;

  // Populate on focus (or click)
  selectReady.addEventListener("focus", () => {
    populateReadySelect();
  });

  // If you prefer "click" or "mousedown" instead of "focus," you can do so.

  // On change => move the task
  selectReady.addEventListener("change", () => {
    const selectedTaskId = selectReady.value;
    if (!selectedTaskId) return; // user picked the placeholder

    // Actually move the task in localStorage
    moveTaskToReady(selectedTaskId);
    // Re-render the board
    renderBoard();

    // Reset the dropdown display back to the placeholder text
    selectReady.selectedIndex = 0; 
  });

  function populateReadySelect() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const backlogTasks = tasks.filter((t) => t.status === "Backlog");

    // Clear old options
    selectReady.innerHTML = "";

    // default placeholder
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "+ Add card"; 
    selectReady.appendChild(placeholderOption);

    // add tasks from Backlog
    backlogTasks.forEach((task) => {
      const opt = document.createElement("option");
      opt.value = task.id;
      opt.textContent = task.title;
      selectReady.appendChild(opt);
    });
  }
}

/** 
 * 2) Moves tasks from Ready → In progress using <select> #addCardInProgress.
 */
export function setupInProgressColumnListeners() {
  const selectInProgress = document.getElementById("addCardInProgress");
  if (!selectInProgress) return;

  selectInProgress.addEventListener("focus", () => {
    populateInProgressSelect();
  });

  selectInProgress.addEventListener("change", () => {
    const selectedTaskId = selectInProgress.value;
    if (!selectedTaskId) return;

    moveTaskToInProgress(selectedTaskId);
    renderBoard();
    // reset display
    selectInProgress.selectedIndex = 0; 
  });

  function populateInProgressSelect() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const readyTasks = tasks.filter((t) => t.status === "Ready");

    selectInProgress.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "+ Add card";
    selectInProgress.appendChild(placeholder);

    readyTasks.forEach((task) => {
      const opt = document.createElement("option");
      opt.value = task.id;
      opt.textContent = task.title;
      selectInProgress.appendChild(opt);
    });
  }
}

/** 
 * 3) Moves tasks from In progress → Finished using <select> #addCardFinished.
 */
export function setupFinishedColumnListeners() {
  const selectFinished = document.getElementById("addCardFinished");
  if (!selectFinished) return;

  selectFinished.addEventListener("focus", () => {
    populateFinishedSelect();
  });

  selectFinished.addEventListener("change", () => {
    const selectedTaskId = selectFinished.value;
    if (!selectedTaskId) return;

    moveTaskToFinished(selectedTaskId);
    renderBoard();
    // reset display
    selectFinished.selectedIndex = 0;
  });

  function populateFinishedSelect() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const inProgressTasks = tasks.filter((t) => t.status === "In progress");

    selectFinished.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "+ Add card";
    selectFinished.appendChild(placeholder);

    inProgressTasks.forEach((task) => {
      const opt = document.createElement("option");
      opt.value = task.id;
      opt.textContent = task.title;
      selectFinished.appendChild(opt);
    });
  }
}