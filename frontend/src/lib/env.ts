const apiMode = import.meta.env.VITE_API_MODE || "mock";
if (apiMode !== "mock" && apiMode !== "real") {
  throw new Error('VITE_API_MODE must be "mock" or "real".');
}

export const env = {
  apiMode,
  isMock: apiMode === "mock",
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, ""),
};
