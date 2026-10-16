import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouter } from "./app/router";
import { StudioProvider } from "./app/studio-provider";
import { ErrorBoundary } from "./app/error-boundary";
import { env } from "./lib/env";
import "./styles/global.css";
import "./styles/application.css";

async function start() {
    if (env.isMock) {
        const { worker } = await import("./lib/mocks/browser");
        await worker.start({
            serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
            onUnhandledFrame: "bypass",
            quiet: true,
        });
    } else if ("serviceWorker" in navigator) {
        // Remove only our mock worker when switching environments. Never remove unrelated workers.
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
            registrations
                .filter((reg) =>
                    reg.active?.scriptURL.endsWith("/mockServiceWorker.js"),
                )
                .map((reg) => reg.unregister()),
        );
    }
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <ErrorBoundary>
                <StudioProvider>
                    <AppRouter />
                </StudioProvider>
            </ErrorBoundary>
        </StrictMode>,
    );
}

void start().catch(() => {
    const root = document.getElementById("root")!;
    const container = document.createElement("main");
    container.className = "startup-error";
    const title = document.createElement("h1");
    title.textContent = "The app could not start.";
    const body = document.createElement("p");
    body.textContent =
        "Mock mode needs service workers on localhost or HTTPS. Check your settings and reload.";
    const button = document.createElement("button");
    button.textContent = "Reload";
    button.onclick = () => window.location.reload();
    container.append(title, body, button);
    root.replaceChildren(container);
});
