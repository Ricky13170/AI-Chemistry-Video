import { useEffect, useState } from "react";
import { jobsApi } from "./jobs-api";
import { isActiveJob } from "../types";
import type { JobsPage } from "../types";
import { errorMessage } from "../../../lib/api-client";

export function useJobsPage(offset: number, revision: string | number) {
  const [page, setPage] = useState<JobsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setPage(null);
    async function load() {
      try {
        const next = await jobsApi.list(offset, controller.signal);
        if (disposed) return;
        setPage(next);
        setLoading(false);
        setError(null);
        if (next.items.some(isActiveJob)) timer = setTimeout(load, 2_500);
      } catch (cause) {
        if (!disposed) {
          setError(errorMessage(cause));
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [offset, revision]);
  return { page, loading, error };
}
