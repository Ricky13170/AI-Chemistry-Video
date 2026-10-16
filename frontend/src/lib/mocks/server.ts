import { setupServer } from "msw/node";

/** Test-only integration. Browser builds import browser.ts instead. */
export const server = setupServer();
