import Database from '@tauri-apps/plugin-sql';
// when using `"withGlobalTauri": true`, you may use
// const Database = window.__TAURI__.sql;

export let db: Database;
if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
  db = await Database.load('sqlite:todos.db');
}

