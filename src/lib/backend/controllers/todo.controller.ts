import { db } from "../db"


export const handleGetTodos = () => {
  return db.select("SELECT * FROM TODOS");
}  
