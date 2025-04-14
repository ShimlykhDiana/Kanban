// src/models/User.js
import { BaseModel } from "./BaseModel";
import { getFromStorage, addToStorage } from "../utils";

export class User extends BaseModel {
  constructor(login, password, role = "user") {
      super();
      this.login = login;
      this.password = password;
      this.role = role;
      this.storageKey = "users";
  }

  get hasAccess() {
    const users = getFromStorage(this.storageKey); 
    if (users.length === 0) return false;

    // check if there's a user with matching login & password
    for (let user of users) {
      if (user.login === this.login && user.password === this.password) {
        // also set this.role = user.role so we know the role
        this.role = user.role;
        return true;
      }
    }
    return false;
  }

  static save(user) {
    try {
      // adds user to 'users' array in localStorage
      addToStorage(user, user.storageKey);
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }
}