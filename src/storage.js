
export function loadTasks(login) {
  const all = JSON.parse(localStorage.getItem("tasksByUser") || "{}");
  return all[login] || [];
}

export function saveTasks(login, list) {
  const all = JSON.parse(localStorage.getItem("tasksByUser") || "{}");
  all[login] = list;
  localStorage.setItem("tasksByUser", JSON.stringify(all));
}