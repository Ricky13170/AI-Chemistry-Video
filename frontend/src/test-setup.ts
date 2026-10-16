import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./lib/mocks/server";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
    cleanup();
    server.resetHandlers();
    localStorage.clear();
    window.history.replaceState(null, "", "/");
});
afterAll(() => server.close());
