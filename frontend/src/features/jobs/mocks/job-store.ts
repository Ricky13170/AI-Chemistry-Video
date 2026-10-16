import { jobSchema } from "../types";
import type { Job, JobConfig } from "../types";
import { workflowSteps } from "../types";
import { createDemoResult } from "../demo-result";

const STORAGE_KEY = "chemistry-studio-mock-jobs-v1";
const STEP_MS = 1_300;
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Time-derived transitions survive reloads and do not require background timers. */
export function createJobStore(
  storage?: StorageLike,
  now: () => number = Date.now,
) {
  let jobs: Job[] = [];
  try {
    const saved: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(saved))
      jobs = saved.flatMap((x) => {
        const parsed = jobSchema.safeParse(x);
        return parsed.success ? [parsed.data] : [];
      });
  } catch {
    /* Blocked or corrupted storage falls back to memory. */
  }
  const persist = () => {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch {
      /* Keep working in memory. */
    }
  };
  const clone = (job: Job) => structuredClone(job);
  function advance(job: Job): Job {
    if (job.status !== "queued" && job.status !== "running") return job;
    const age = Math.max(0, now() - Date.parse(job.created_at));
    const index = Math.floor(Math.max(0, age - 450) / STEP_MS);
    if (age < 450) return job;
    job.updated_at = new Date(now()).toISOString();
    if (job.config.chemical.toLowerCase() === "fail-demo" && index >= 2) {
      job.status = "failed";
      job.progress = 40;
      job.current_step = "script";
      job.error =
        "Simulated provider failure. This demo intentionally fails; edit the compound to run a successful job.";
    } else if (index >= workflowSteps.length) {
      job.status = "completed";
      job.progress = 100;
      job.current_step = "render";
      job.result = createDemoResult(job.config);
    } else {
      job.status = "running";
      job.progress = index * 20;
      job.current_step = workflowSteps[index];
    }
    return job;
  }
  function find(id: string) {
    const job = jobs.find((x) => x.id === id);
    return job ? advance(job) : null;
  }
  function create(config: JobConfig) {
    const timestamp = new Date(now()).toISOString();
    const job: Job = {
      id: crypto.randomUUID(),
      config: structuredClone(config),
      status: "queued",
      progress: 0,
      current_step: null,
      created_at: timestamp,
      updated_at: timestamp,
      error: null,
      result: null,
    };
    jobs.unshift(job);
    persist();
    return clone(job);
  }
  return {
    create,
    get(id: string) {
      const job = find(id);
      persist();
      return job ? clone(job) : null;
    },
    list(limit: number, offset: number) {
      jobs.forEach(advance);
      persist();
      return {
        items: jobs.slice(offset, offset + limit).map(clone),
        total: jobs.length,
        limit,
        offset,
      };
    },
    cancel(id: string): Job | null {
      const job = find(id);
      if (!job) return null;
      if (job.status === "queued" || job.status === "running") {
        job.status = "cancelled";
        job.updated_at = new Date(now()).toISOString();
        persist();
      }
      return clone(job);
    },
    retry(id: string): Job | null {
      const job = find(id);
      return job ? create(job.config) : null;
    },
  };
}
export type JobStore = ReturnType<typeof createJobStore>;
