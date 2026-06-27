import { seedDatabase } from "./seed.js";
import { setupDatabase } from "./setup.js";

let initialization: Promise<void> | undefined;

export function initializeDatabase() {
  initialization ??= (async () => {
    await setupDatabase();
    await seedDatabase();
  })();

  return initialization;
}
