import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import type { ReactNode } from "react";
import { jobsApi } from "../features/jobs/api/jobs-api";
import { useJob } from "../features/jobs/api/use-job";
import { defaultConfig, isActiveJob } from "../features/jobs/types";
import type { Job, JobConfig } from "../features/jobs/types";
import { env } from "../lib/env";
import { errorMessage } from "../lib/api-client";

const selectedKey = `chemistry-studio-selected-${env.apiMode}`;
function restoredId() {
    try {
        return localStorage.getItem(selectedKey);
    } catch {
        return null;
    }
}

type StudioState = {
    draft: JobConfig;
    setDraft: (config: JobConfig) => void;
    job: Job | null;
    selectedId: string | null;
    totalJobs: number;
    loading: boolean;
    busy: boolean;
    canSubmit: boolean;
    pending: boolean;
    error: string | null;
    notice: string;
    notify: (message: string) => void;
    clearError: () => void;
    submit: () => Promise<void>;
    cancel: () => Promise<void>;
    retry: () => Promise<void>;
    reset: () => void;
    openJob: (job: Job) => void;
};
const StudioContext = createContext<StudioState | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
    const [draft, setDraft] = useState<JobConfig>({ ...defaultConfig });
    const [selectedId, setSelectedId] = useState(restoredId);
    const [revision, setRevision] = useState(0);
    const [mutationError, setMutationError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const [notice, setNotice] = useState("");
    const [totalJobs, setTotalJobs] = useState(0);
    const actionLock = useRef(false);
    const restoreDraft = useRef(Boolean(selectedId));
    const { job, error, loading } = useJob(selectedId, revision);
    // A saved job can still be running before the first poll returns.
    const busy =
        pending ||
        isActiveJob(job) ||
        Boolean(selectedId && loading) ||
        Boolean(job && restoreDraft.current);
    const notify = useCallback((message: string) => setNotice(message), []);

    useEffect(() => {
        try {
            if (selectedId) localStorage.setItem(selectedKey, selectedId);
            else localStorage.removeItem(selectedKey);
        } catch {
            /* Navigation continues when browser storage is blocked. */
        }
    }, [selectedId]);
    useEffect(() => {
        if (job && restoreDraft.current) {
            setDraft(job.config);
            restoreDraft.current = false;
        }
    }, [job]);
    useEffect(() => {
        const controller = new AbortController();
        void jobsApi
            .list(0, controller.signal)
            .then((page) => setTotalJobs(page.total))
            .catch(() => {
                /* History page exposes fetch errors. */
            });
        return () => controller.abort();
    }, [selectedId, job?.status]);
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(""), 4_000);
        return () => clearTimeout(timer);
    }, [notice]);

    async function mutate(action: () => Promise<Job>, message: string) {
        if (actionLock.current) return;
        actionLock.current = true;
        setPending(true);
        setMutationError(null);
        try {
            const next = await action();
            restoreDraft.current = false;
            setDraft(next.config);
            setSelectedId(next.id);
            setRevision((x) => x + 1);
            notify(message);
        } catch (cause) {
            setMutationError(errorMessage(cause));
        } finally {
            actionLock.current = false;
            setPending(false);
        }
    }

    function reset() {
        if (busy || actionLock.current) return;
        restoreDraft.current = false;
        setSelectedId(null);
        setDraft({ ...defaultConfig });
        setMutationError(null);
        notify("Settings and preview reset. Your history is kept.");
    }
    const state: StudioState = {
        draft: job && restoreDraft.current ? job.config : draft,
        setDraft,
        job,
        selectedId,
        totalJobs,
        loading,
        busy,
        pending,
        canSubmit: !busy && (!selectedId || Boolean(job)),
        error: mutationError || error,
        notice,
        notify,
        clearError() {
            setMutationError(null);
            setRevision((x) => x + 1);
        },
        async submit() {
            if (busy || (selectedId && !job)) return;
            await mutate(
                () => jobsApi.create(draft),
                env.isMock ? "Demo job queued." : "Job queued.",
            );
        },
        async cancel() {
            if (!job || !isActiveJob(job)) return;
            await mutate(() => jobsApi.cancel(job.id), "Job cancelled.");
        },
        async retry() {
            if (!job || !["failed", "cancelled"].includes(job.status)) return;
            await mutate(
                () => jobsApi.retry(job.id),
                "A new attempt has been queued.",
            );
        },
        reset,
        openJob(next) {
            if (busy && selectedId !== next.id) {
                notify("Finish or cancel the current job before opening another.");
                return;
            }
            restoreDraft.current = false;
            setDraft(next.config);
            setMutationError(null);
            setSelectedId(next.id);
            setRevision((x) => x + 1);
        },
    };
    return (
        <StudioContext.Provider value={state}>{children}</StudioContext.Provider>
    );
}

export function useStudio() {
    const context = useContext(StudioContext);
    if (!context)
        throw new Error("useStudio must be used within StudioProvider.");
    return context;
}
