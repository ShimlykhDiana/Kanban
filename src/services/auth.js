import { appState } from "../app";
import { User } from "../models/User";
  


export const authUser = function(login, password) {
  const user = new User(login, password);
  if (!user.hasAccess) return false;
  
  localStorage.setItem("user", JSON.stringify({
    login: user.login,
    role: "user" 
  }));

  appState.currentUser = user;
  return true;
};

