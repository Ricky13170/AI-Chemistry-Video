import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStudio } from "../../app/studio-provider";
import { Icon } from "../../components/icon";
import { ErrorBanner } from "../../components/error-banner";
import { useJobsPage } from "../jobs/api/use-jobs-page";
import { outputLabels } from "../jobs/types";
import { env } from "../../lib/env";

export function HistoryPage() {
    const { job, busy, selectedId, openJob } = useStudio();
    const [offset, setOffset] = useState(0);
    const [refresh, setRefresh] = useState(0);
    const { page, loading, error } = useJobsPage(
        offset,
        `${job?.id}-${job?.status}-${refresh}`,
    );
    const navigate = useNavigate();
    return (
        <>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">
                        <Icon name="history" small />
                        YOUR STORY LIBRARY
                    </p>
                    <h1>Every idea, in one place.</h1>
                    <p className="subtitle">
                        Revisit your jobs, inspect progress, and reuse a starting point.
                    </p>
                </div>
                <Link to="/" className="text-button">
                    <Icon name="arrow" small />
                    Open studio
                </Link>
            </div>
            {error && (
                <ErrorBanner message={error} onRetry={() => setRefresh((x) => x + 1)} />
            )}
            <section
                className="card history-card"
                aria-label="Job history"
                aria-busy={loading}
            >
                <div className="panel-top">
                    <h2 className="card-title">
                        Recent jobs <span className="pill">{page?.total ?? "…"}</span>
                    </h2>
                    <span className="tiny">
                        {env.isMock ? "Demo jobs · saved in this browser" : "Newest first"}
                    </span>
                </div>
                {loading ? (
                    <div className="empty-state" role="status">
                        <span className="loading-dot" />
                        Loading your stories…
                    </div>
                ) : !error && !page?.items.length ? (
                    <div className="empty-state">
                        <Icon name="history" />
                        <h3>Your first story starts here.</h3>
                        <p>Create a job on the Dashboard to see it in History.</p>
                        <Link to="/" className="text-button">
                            Go to Dashboard
                            <Icon name="arrow" small />
                        </Link>
                    </div>
                ) : (
                    page?.items.map((item) => (
                        <button
                            type="button"
                            className="history-job"
                            key={item.id}
                            disabled={busy && selectedId !== item.id}
                            onClick={() => {
                                openJob(item);
                                navigate("/");
                            }}
                            aria-label={`Open ${item.config.chemical}, ${item.status}`}
                        >
                            <span className="history-icon">
                                <Icon
                                    name={
                                        item.config.output_type === "video"
                                            ? "video"
                                            : item.config.output_type === "slides"
                                                ? "slides"
                                                : "file"
                                    }
                                />
                            </span>
                            <span className="history-description">
                                <strong>{item.config.chemical}</strong>
                                <small>
                                    {outputLabels[item.config.output_type]} ·{" "}
                                    {item.config.duration_seconds}s · {item.config.aspect_ratio}
                                    {env.isMock ? " · Demo" : ""}
                                </small>
                            </span>
                            <time className="history-date" dateTime={item.created_at}>
                                {new Intl.DateTimeFormat("en", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }).format(new Date(item.created_at))}
                            </time>
                            <span className={`job-badge status-${item.status}`}>
                                {item.status}
                            </span>
                            <Icon name="arrow" small />
                        </button>
                    ))
                )}
                {page && page.total > 10 && (
                    <div className="pagination">
                        <button
                            type="button"
                            className="text-button"
                            disabled={loading || offset === 0}
                            onClick={() => setOffset((x) => Math.max(0, x - 10))}
                        >
                            Previous
                        </button>
                        <span>
                            {offset + 1}–{Math.min(offset + 10, page.total)} of {page.total}
                        </span>
                        <button
                            type="button"
                            className="text-button"
                            disabled={loading || offset + 10 >= page.total}
                            onClick={() => setOffset((x) => x + 10)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>
        </>
    );
}
