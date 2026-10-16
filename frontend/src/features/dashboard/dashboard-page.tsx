import { Link } from "react-router-dom";
import { useStudio } from "../../app/studio-provider";
import { Icon } from "../../components/icon";
import { ErrorBanner } from "../../components/error-banner";
import { ConfigForm } from "./config-form";
import { PreviewStudio } from "./preview-studio";
import { WorkflowProgress } from "../jobs/components/workflow-progress";

export function DashboardPage() {
    const { busy, job, error, clearError, reset } = useStudio();
    return (
        <>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">
                        <Icon name="spark" small />
                        YOUR NEXT CHEMISTRY STORY
                    </p>
                    <h1>Turn chemistry into a story.</h1>
                    <p className="subtitle">
                        Choose a compound. Shape your story. Make science visual.
                    </p>
                </div>
                <button
                    type="button"
                    className="text-button"
                    onClick={reset}
                    disabled={busy}
                    title="Restore default settings and preview. History is kept."
                >
                    <Icon name="reset" small />
                    Reset settings
                </button>
            </div>
            {error && <ErrorBanner message={error} onRetry={clearError} />}
            <div className="workspace">
                <ConfigForm />
                <div className="stage-column">
                    <PreviewStudio />
                    <WorkflowProgress />
                    <div className="bottom-grid">
                        <section className="card mini-card">
                            <h3>Pick up your ideas</h3>
                            <p>
                                {job
                                    ? `Current story: ${job.config.chemical}`
                                    : "Your recent jobs will appear in History."}
                            </p>
                            <Link to="/history" className="inline-link">
                                View history
                                <Icon name="arrow" />
                            </Link>
                        </section>
                        <section className="card mini-card tip">
                            <Icon name="bulb" />
                            <h3>A little inspiration</h3>
                            <p>
                                Start with something familiar.
                                <br />A small story can open up a whole new world.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
