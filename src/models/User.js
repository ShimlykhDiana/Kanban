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
    let users = getFromStorage(this.storageKey); //забирает всех юзеров и проверяет, есть ли по данному ключу хоть один юзер, всегда возвращает массив
    if (users.length == 0) return false; // если нет юзеров
    for (let user of users) { //если есть логин юзера из localStorage совпадает, то будет true
      if (user.login == this.login && user.password == this.password)
        return true;
    }
    return false;
  }
  static save(user) {
    try {
      addToStorage(user, user.storageKey);
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }
}


