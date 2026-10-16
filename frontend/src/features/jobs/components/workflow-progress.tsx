import { useStudio } from "../../../app/studio-provider";
import { Icon } from "../../../components/icon";
import type { IconName } from "../../../components/icon";
import { isActiveJob, stepLabels, workflowSteps } from "../types";
import { env } from "../../../lib/env";

const icons: IconName[] = ["search", "book", "file", "check", "video"];

export function WorkflowProgress() {
    const { job, pending, cancel, retry } = useStudio();
    const index = job?.current_step
        ? workflowSteps.indexOf(job.current_step)
        : -1;
    const active = isActiveJob(job);
    const description = !job
        ? "Set things up on the left. Preview your story here."
        : job.status === "queued"
            ? "Your job is waiting to start."
            : job.status === "running"
                ? `${env.isMock ? "Simulating" : "Processing"}: ${stepLabels[index] || "starting"}…`
                : job.status === "completed"
                    ? job.result?.summary || "Your output is ready."
                    : job.status === "failed"
                        ? job.error || "This job failed. Try again."
                        : "The job was cancelled. You can start another attempt.";
    return (
        <section className="card workflow" aria-label="Job progress">
            <div className="section-header">
                <h3>
                    <Icon name="layers" />
                    Your creation workflow
                </h3>
                <span className={`workflow-status status-${job?.status || "idle"}`}>
                    {job?.status || "Ready to begin"}
                </span>
            </div>
            <div className="steps">
                {workflowSteps.map((step, n) => (
                    <div
                        key={step}
                        className={`step ${active && n === index ? "active" : ""} ${job?.status === "completed" || (n < index && Boolean(job)) ? "done" : ""} ${job?.status === "failed" && n === index ? "failed" : ""}`}
                    >
                        <span className="step-circle">
                            <Icon name={icons[n]} />
                        </span>
                        <span className="step-label">{stepLabels[n]}</span>
                    </div>
                ))}
            </div>
            <div
                className="workflow-meter"
                role="progressbar"
                aria-label="Workflow completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={job?.progress || 0}
            >
                <span style={{ width: `${job?.progress || 0}%` }} />
            </div>
            <div className="progress-detail" aria-live="polite">
                <span>{description}</span>
                <strong>{job ? `${job.progress}%` : "5 steps · 1 story"}</strong>
            </div>
            {job && (
                <div className="job-actions">
                    {active && (
                        <button
                            type="button"
                            className="text-button"
                            disabled={pending}
                            onClick={() => void cancel()}
                        >
                            <Icon name="close" small />
                            Cancel job
                        </button>
                    )}
                    {["failed", "cancelled"].includes(job.status) && (
                        <button
                            type="button"
                            className="text-button"
                            disabled={pending}
                            onClick={() => void retry()}
                        >
                            <Icon name="reset" small />
                            Retry original settings
                        </button>
                    )}
                    <span className="tiny job-id">Job {job.id.slice(0, 8)}</span>
                </div>
            )}
        </section>
    );
}
