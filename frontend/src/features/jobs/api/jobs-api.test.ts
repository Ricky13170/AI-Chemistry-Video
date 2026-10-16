import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw/http";
import { server } from "../../../lib/mocks/server";
import { createHandlers } from "../../../lib/mocks/handlers";
import { createJobStore } from "../mocks/job-store";
import { defaultConfig } from "../types";
import { jobsApi } from "./jobs-api";
import { requestJson } from "../../../lib/api-client";

describe("jobs HTTP contract", () => {
  let now = Date.now();
  beforeEach(() => {
    now = Date.now();
    server.use(
      ...createHandlers(
        createJobStore(undefined, () => now),
        0,
      ),
    );
  });

  it("submits settings through fetch, polls the job, and lists the completed result", async () => {
    const created = await jobsApi.create({
      ...defaultConfig,
      output_type: "slides",
      aspect_ratio: "9:16",
    });
    expect(created.config.output_type).toBe("slides");
    now += 8_000;
    expect((await jobsApi.get(created.id)).status).toBe("completed");
    const page = await jobsApi.list();
    expect(page.total).toBe(1);
    expect(page.items[0].id).toBe(created.id);
  });

  it("validates malformed requests at the mock endpoint", async () => {
    await expect(
      requestJson("/api/jobs", {
        method: "POST",
        body: JSON.stringify({ chemical: "" }),
      }),
    ).rejects.toMatchObject({ status: 422 });
    await expect(requestJson("/api/jobs?limit=bad")).rejects.toMatchObject({
      status: 422,
    });
  });

  it("returns 404 for unknown jobs", async () => {
    await expect(jobsApi.get("not-found")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("cancels active jobs and rejects illegal state transitions", async () => {
    const created = await jobsApi.create(defaultConfig);
    await expect(jobsApi.retry(created.id)).rejects.toMatchObject({
      status: 409,
    });
    expect((await jobsApi.cancel(created.id)).status).toBe("cancelled");
    await expect(jobsApi.cancel(created.id)).rejects.toMatchObject({
      status: 409,
    });
    expect((await jobsApi.retry(created.id)).id).not.toBe(created.id);
  });

  it("surfaces API errors and rejects response schema mismatches", async () => {
    server.use(
      http.post("*/api/jobs", () =>
        HttpResponse.json({ detail: "Provider unavailable." }, { status: 503 }),
      ),
    );
    await expect(jobsApi.create(defaultConfig)).rejects.toThrow(
      "Provider unavailable.",
    );
    server.use(
      http.get("*/api/jobs/:id", () => HttpResponse.json({ id: "incomplete" })),
    );
    await expect(jobsApi.get("anything")).rejects.toThrow();
  });
});
