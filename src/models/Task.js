import { BaseModel }        from "./BaseModel.js";
import { v4 as uuid }       from "uuid";
import { loadTasks, saveTasks } from "../storage.js";
import { currentLogin }        from "../session.js";


export class Task extends BaseModel {
  constructor(title, status = "Backlog") {
    super();
    this.title  = title;
    this.status = status;
  }
}

export function createBacklogTask(title) {
  const login = currentLogin();        // whose list
  const tasks = loadTasks(login);      // read that list

  tasks.push({
    id     : uuid(),
    title  : title,
    status : "Backlog",
    owner  : login  
  });

  saveTasks(login, tasks);  
}


export function moveTaskToReady(id)       { move(id, "Ready");       }
export function moveTaskToInProgress(id)  { move(id, "In progress"); }
export function moveTaskToFinished(id)    { move(id, "Finished");    }

function move(taskId, newStatus) {
  const login = currentLogin();
  const tasks = loadTasks(login);

  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    tasks[idx].status = newStatus;
    saveTasks(login, tasks);
  }
}