import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { AppRouter } from "../../app/router";
import { StudioProvider } from "../../app/studio-provider";
import { server } from "../../lib/mocks/server";
import { createHandlers } from "../../lib/mocks/handlers";
import { createJobStore } from "../jobs/mocks/job-store";
import type { JobStore } from "../jobs/mocks/job-store";
import { defaultConfig } from "../jobs/types";

describe("dashboard workflow", () => {
    let store: JobStore;
    beforeEach(() => {
        store = createJobStore();
        server.use(...createHandlers(store, 0));
    });
    const mount = () =>
        render(
            <StudioProvider>
                <AppRouter />
            </StudioProvider>,
        );

    it("restores a completed job after reload and shows an outline without a fabricated video", async () => {
        let now = Date.now();
        const restoredStore = createJobStore(undefined, () => now);
        const restored = restoredStore.create({
            ...defaultConfig,
            chemical: "Ethanol",
        });
        now += 8_000;
        localStorage.setItem("chemistry-studio-selected-mock", restored.id);
        server.use(...createHandlers(restoredStore, 0));
        const user = userEvent.setup();
        const { container } = mount();
        expect(
            await screen.findByText(
                /Demo complete\. This result contains an outline/,
            ),
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/Compound name/)).toHaveValue("Ethanol");
        expect(container.querySelector("video")).not.toBeInTheDocument();
        await user.click(screen.getByRole("tab", { name: "Script" }));
        expect(screen.getByText("Opening — spark curiosity")).toBeVisible();
    });

    it("changes output settings and resets without deleting history or offering language selection", async () => {
        const user = userEvent.setup();
        mount();
        expect(screen.queryByLabelText(/language/i)).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Slides" }));
        await user.click(screen.getByRole("button", { name: "9:16" }));
        expect(
            screen.getByRole("button", { name: /Generate slides/ }),
        ).toBeEnabled();
        await user.clear(screen.getByLabelText(/Compound name/));
        await user.type(screen.getByLabelText(/Compound name/), "Ethanol");
        await user.click(screen.getByRole("button", { name: "Reset settings" }));
        expect(screen.getByLabelText(/Compound name/)).toHaveValue("Water (H₂O)");
        expect(
            screen.getByRole("button", { name: /Generate video/ }),
        ).toBeEnabled();
    });

    it("prevents duplicate submission, cancels a job, and opens it from History", async () => {
        const user = userEvent.setup();
        mount();
        await user.dblClick(screen.getByRole("button", { name: /Generate video/ }));
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: "Cancel job" }),
            ).toBeInTheDocument(),
        );
        expect(store.list(10, 0).total).toBe(1);
        expect(screen.getByLabelText(/Compound name/)).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "Cancel job" }));
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: "Retry original settings" }),
            ).toBeEnabled(),
        );
        await user.click(screen.getByRole("link", { name: /^History/ }));
        await user.click(
            await screen.findByRole("button", { name: /Open Water.*cancelled/ }),
        );
        expect(
            await screen.findByRole("heading", {
                name: "Turn chemistry into a story.",
            }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/Compound name/)).toHaveValue("Water (H₂O)");
    });

    it("shows API failure and preserves the form for another attempt", async () => {
        server.use(
            http.post("*/api/jobs", () =>
                HttpResponse.json({ detail: "Provider unavailable." }, { status: 503 }),
            ),
        );
        const user = userEvent.setup();
        mount();
        await user.click(screen.getByRole("button", { name: /Generate video/ }));
        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Provider unavailable.",
        );
        expect(
            screen.getByRole("button", { name: /Generate video/ }),
        ).toBeEnabled();
        expect(screen.getByLabelText(/Compound name/)).toHaveValue("Water (H₂O)");
    });

    it("rejects a whitespace-only compound before sending an API request", async () => {
        const user = userEvent.setup();
        mount();
        await user.clear(screen.getByLabelText(/Compound name/));
        await user.type(screen.getByLabelText(/Compound name/), "   ");
        await user.click(screen.getByRole("button", { name: /Generate video/ }));
        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Enter a compound name or formula.",
        );
        expect(store.list(10, 0).total).toBe(0);
    });
});
