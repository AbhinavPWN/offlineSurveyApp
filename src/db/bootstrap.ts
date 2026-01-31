import { runMigration } from "./migrate";

let ready = false;
let promise: Promise<void> | null = null;

export function ensureDbReady(): Promise<void> {
  if (ready) {
    return Promise.resolve();
  }

  if (!promise) {
    promise = (async () => {
      await runMigration();
      ready = true;
      console.log("Database is ready");
    })();
  }

  return promise;
}

export function isDbReady() {
  return ready;
}
