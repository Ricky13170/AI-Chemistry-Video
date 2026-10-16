import type { ZodType } from "zod";
import { env } from "../../../lib/env";
import { ApiError, requestJson } from "../../../lib/api-client";
import { jobConfigSchema, jobSchema, jobsPageSchema } from "../types";
import type { JobConfig } from "../types";

function parseResponse<T>(schema: ZodType<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(
      "The API returned an unexpected response. Please try again.",
      502,
    );
  }
  return parsed.data;
}

const base = `${env.apiBaseUrl}/jobs`;
export const jobsApi = {
  async create(config: JobConfig, signal?: AbortSignal) {
    const body = jobConfigSchema.parse(config);
    return parseResponse(
      jobSchema,
      await requestJson(base, {
        method: "POST",
        body: JSON.stringify(body),
        signal,
      }),
    );
  },
  async get(id: string, signal?: AbortSignal) {
    return parseResponse(
      jobSchema,
      await requestJson(`${base}/${encodeURIComponent(id)}`, { signal }),
    );
  },
  async list(offset = 0, signal?: AbortSignal) {
    return parseResponse(
      jobsPageSchema,
      await requestJson(`${base}?limit=10&offset=${offset}`, { signal }),
    );
  },
  async cancel(id: string) {
    return parseResponse(
      jobSchema,
      await requestJson(`${base}/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
      }),
    );
  },
  async retry(id: string) {
    return parseResponse(
      jobSchema,
      await requestJson(`${base}/${encodeURIComponent(id)}/retry`, {
        method: "POST",
      }),
    );
  },
};
