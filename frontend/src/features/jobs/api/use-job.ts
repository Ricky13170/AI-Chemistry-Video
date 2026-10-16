import { useEffect, useState } from "react";
import { jobsApi } from "./jobs-api";
import { isActiveJob } from "../types";
import type { Job } from "../types";
import { ApiError, errorMessage } from "../../../lib/api-client";

export function useJob(id: string | null, revision = 0) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setJob(null);
    setError(null);
    if (!id) {
      setLoading(false);
      return;
    }
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    setLoading(true);
    async function poll() {
      try {
        const next = await jobsApi.get(id!, controller.signal);
        if (disposed) return;
        setJob(next);
        setError(null);
        setLoading(false);
        if (isActiveJob(next)) timer = setTimeout(poll, 1_200);
      } catch (cause) {
        if (disposed) return;
        setLoading(false);
        setError(errorMessage(cause));
        // Reconnect transient failures; do not loop forever for missing jobs.
        if (
          !(cause instanceof ApiError) ||
          (cause.status !== 404 && cause.status !== 422)
        ) {
          timer = setTimeout(poll, 3_000);
        }
      }
    }
    void poll();
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [id, revision]);

  return { job, error, loading };
}
