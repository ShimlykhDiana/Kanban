import { BaseModel } from "./BaseModel.js";
import { v4 as uuid } from "uuid";

export class Task extends BaseModel {
  constructor(title, status = "Backlog") {
    super();
    this.title = title;
    this.status = status;
  }
}

/** 
 * Helper: load tasks for the current user from localStorage
 */
function loadUserTasks(login) {
  const key = `tasks_${login}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  return JSON.parse(data);
}

/** 
 * Helper: save tasks array for the current user to localStorage
 */
function saveUserTasks(login, tasks) {
  const key = `tasks_${login}`;
  localStorage.setItem(key, JSON.stringify(tasks));
}

/**
 * createBacklogTask(taskTitle)
 * Adds a new task with status = 'Backlog' to the current user's task list.
 */
export function createBacklogTask(taskTitle) {
  // 1) Identify current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) return;  // no user => do nothing

  // 2) Load that user's tasks
  const login = currentUser.login;
  const tasks = loadUserTasks(login);

  // 3) Create new task
  tasks.push({
    id: uuid(),
    title: taskTitle,
    status: "Backlog"
  });

  // 4) Save them back
  saveUserTasks(login, tasks);
}

/**
 * moveTaskToReady(taskId)
 */
export function moveTaskToReady(taskId) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) return;

  const login = currentUser.login;
  const tasks = loadUserTasks(login);
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = "Ready";
    saveUserTasks(login, tasks);
  }
}

/**
 * moveTaskToInProgress(taskId)
 */
export function moveTaskToInProgress(taskId) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) return;

  const login = currentUser.login;
  const tasks = loadUserTasks(login);
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = "In progress";
    saveUserTasks(login, tasks);
  }
}

/**
 * moveTaskToFinished(taskId)
 */
export function moveTaskToFinished(taskId) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) return;

  const login = currentUser.login;
  const tasks = loadUserTasks(login);
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = "Finished";
    saveUserTasks(login, tasks);
  }
}