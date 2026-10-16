import { http, HttpResponse } from "msw/http";
import { delay } from "msw/utils/delay";
import { createJobStore } from "../../features/jobs/mocks/job-store";
import type { JobStore } from "../../features/jobs/mocks/job-store";
import { jobConfigSchema } from "../../features/jobs/types";
import { env } from "../env";

let storage: Storage | undefined;
try {
  storage = globalThis.localStorage;
} catch {
  /* Storage may be unavailable. */
}
export const mockStore = createJobStore(storage);

export function createHandlers(store: JobStore, latency = 250) {
  // VITE_API_BASE_URL must match in both real and mock modes.
  const endpoint = (path: string) =>
    `${env.apiBaseUrl.startsWith("http") ? env.apiBaseUrl : "*" + env.apiBaseUrl}${path}`;
  const missing = () =>
    HttpResponse.json({ detail: "Job not found." }, { status: 404 });
  return [
    http.post(endpoint("/jobs"), async ({ request }) => {
      await delay(latency);
      const body: unknown = await request.json().catch(() => null);
      const parsed = jobConfigSchema.safeParse(body);
      if (!parsed.success)
        return HttpResponse.json(
          { detail: "Invalid job configuration." },
          { status: 422 },
        );
      return HttpResponse.json(store.create(parsed.data), { status: 202 });
    }),
    http.get(endpoint("/jobs"), async ({ request }) => {
      await delay(latency);
      const url = new URL(request.url);
      const limit = Number(url.searchParams.get("limit") || 10);
      const offset = Number(url.searchParams.get("offset") || 0);
      if (
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100 ||
        !Number.isInteger(offset) ||
        offset < 0
      ) {
        return HttpResponse.json(
          { detail: "Invalid pagination." },
          { status: 422 },
        );
      }
      return HttpResponse.json(store.list(limit, offset));
    }),
    http.get(endpoint("/jobs/:id"), async ({ params }) => {
      await delay(latency);
      const job = store.get(String(params.id));
      return job ? HttpResponse.json(job) : missing();
    }),
    http.post(endpoint("/jobs/:id/cancel"), async ({ params }) => {
      await delay(latency);
      const job = store.get(String(params.id));
      if (!job) return missing();
      if (!["queued", "running"].includes(job.status))
        return HttpResponse.json(
          { detail: "Only active jobs can be cancelled." },
          { status: 409 },
        );
      return HttpResponse.json(store.cancel(job.id));
    }),
    http.post(endpoint("/jobs/:id/retry"), async ({ params }) => {
      await delay(latency);
      const job = store.get(String(params.id));
      if (!job) return missing();
      if (!["failed", "cancelled"].includes(job.status))
        return HttpResponse.json(
          { detail: "Only failed or cancelled jobs can be retried." },
          { status: 409 },
        );
      return HttpResponse.json(store.retry(job.id), { status: 202 });
    }),
  ];
}
export const handlers = createHandlers(mockStore);
