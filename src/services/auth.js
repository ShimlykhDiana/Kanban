// src/services/auth.js
import { appState } from "../app";
import { User } from "../models/User";

export const authUser = function(login, password) {
  const user = new User(login, password);
  if (!user.hasAccess) return false;

  // store the actual role we found in user.hasAccess
  localStorage.setItem("user", JSON.stringify({
    login: user.login,
    role: user.role 
  }));

  appState.currentUser = user;
  return true;
};