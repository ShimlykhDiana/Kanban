export const currentLogin = () =>
  JSON.parse(localStorage.getItem("user") || "{}").login || "";