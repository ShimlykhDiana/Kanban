import { v4 as uuid } from "uuid"; //библиотека гарантирует уникальное значение

export class BaseModel {
  constructor() {
    this.id = uuid();
  }
}
 
