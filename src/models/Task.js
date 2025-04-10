
import { BaseModel } from "./BaseModel.js";
import { v4 as uuid } from "uuid";

export class Task extends BaseModel {
  constructor(title, status = "Backlog") {
    super();
    this.title = title;
    this.status = status;
  }
}

export function createBacklogTask(taskTitle) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({
    id: uuid(),
    title: taskTitle,
    status: "Backlog"
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

export function moveTaskToReady(taskId) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = "Ready";
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

export function moveTaskToInProgress(taskId) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = "In progress";
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

export function moveTaskToFinished(taskId) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = "Finished";
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

