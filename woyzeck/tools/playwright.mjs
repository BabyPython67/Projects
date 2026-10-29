// Lädt Playwright: aus node_modules dieses Ordners (npm install) oder aus einer globalen Installation.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
export function ladePlaywright() {
  for (const name of ["playwright", "/opt/node-tools/node_modules/playwright"]) {
    try { return require(name); } catch { /* weiter */ }
  }
  return null;
}
