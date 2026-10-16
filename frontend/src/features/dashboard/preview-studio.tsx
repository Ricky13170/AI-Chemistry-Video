import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/icon";
import type { IconName } from "../../components/icon";
import { useStudio } from "../../app/studio-provider";
import { LabIllustration } from "./lab-illustration";
import { createDemoResult } from "../jobs/demo-result";
import { env } from "../../lib/env";

const tabs: {
    id: "preview" | "script" | "sources";
    label: string;
    icon: IconName;
}[] = [
        { id: "preview", label: "Preview", icon: "video" },
        { id: "script", label: "Script", icon: "file" },
        { id: "sources", label: "Sources", icon: "book" },
    ];
const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
function safeUrl(value: string) {
    try {
        return ["https:", "http:"].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}

export function PreviewStudio() {
    const { draft, job, loading, notify } = useStudio();
    const [tab, setTab] = useState<"preview" | "script" | "sources">("preview");
    const [playing, setPlaying] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const stageRef = useRef<HTMLDivElement>(null);
    const currentConfig = job?.config || draft;
    const duration = currentConfig.duration_seconds;
    const isWater = currentConfig.chemical === "Water (H₂O)";
    const result = job?.result;
    const demoResult = createDemoResult(currentConfig);
    const sections =
        result?.script_sections || (env.isMock ? demoResult.script_sections : []);
    const video = result?.artifacts.find(
        (x) => x.kind === "video" && safeUrl(x.url),
    );
    const hasDemoPoster = env.isMock && !video;

    useEffect(() => {
        setPlaying(false);
        setElapsed(0);
    }, [job?.id, duration]);
    useEffect(() => {
        if (currentConfig.output_type === "script") setTab("script");
        else setTab("preview");
    }, [currentConfig.output_type]);
    useEffect(() => {
        if (tab !== "preview") setPlaying(false);
    }, [tab]);
    useEffect(() => {
        if (!playing) return;
        const timer = setInterval(
            () =>
                setElapsed((value) => {
                    if (value + 1 >= duration) {
                        setPlaying(false);
                        return duration;
                    }
                    return value + 1;
                }),
            1_000,
        );
        return () => clearInterval(timer);
    }, [playing, duration]);
    useEffect(() => {
        const stop = () => {
            if (document.hidden) setPlaying(false);
        };
        document.addEventListener("visibilitychange", stop);
        return () => document.removeEventListener("visibilitychange", stop);
    }, []);
    function togglePlay() {
        if (elapsed >= duration) setElapsed(0);
        setPlaying((value) => !value);
    }
    async function fullscreen() {
        try {
            await stageRef.current?.requestFullscreen();
        } catch {
            notify("Fullscreen is unavailable here.");
        }
    }
    function exportSettings() {
        const payload = {
            ...currentConfig,
            ...(env.isMock ? { is_demo: true } : {}),
        };
        const url = URL.createObjectURL(
            new Blob([JSON.stringify(payload, null, 2)], {
                type: "application/json",
            }),
        );
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "chemistry-settings.json";
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 2_000);
        notify("Settings downloaded as JSON.");
    }
    return (
        <section className="card preview-card" aria-label="Output preview">
            <div className="panel-top">
                <h2 className="card-title">
                    <Icon name="video" />
                    Preview studio
                </h2>
                <span className={`pill ${job?.status === "completed" ? "teal" : ""}`}>
                    {loading
                        ? "Loading job…"
                        : job?.status ||
                        (env.isMock ? "Design preview" : "Awaiting output")}
                </span>
            </div>
            <div
                role="tabpanel"
                id="preview-panel"
                aria-labelledby="preview-tab"
                hidden={tab !== "preview"}
            >
                {video ? (
                    <div className="real-video-wrap">
                        <video
                            key={video.url}
                            src={video.url}
                            controls
                            preload="metadata"
                            className="real-video"
                        >
                            Your browser does not support video playback.
                        </video>
                    </div>
                ) : (
                    <div className="preview-wrap">
                        <div
                            ref={stageRef}
                            className={`video-stage ${currentConfig.aspect_ratio === "9:16" ? "vertical" : currentConfig.aspect_ratio === "1:1" ? "square" : ""} ${playing ? "playing" : ""}`}
                        >
                            <div className="stage-grid" />
                            <div className="stage-label">
                                <i className="status-dot" />
                                CHEMISTRY IN MOTION
                            </div>
                            <span className="stage-number">STORY / 001</span>
                            <div className="preview-content">
                                <small>EXPLORE THE MOLECULAR WORLD</small>
                                <h2>
                                    {isWater ? (
                                        <>
                                            A little drop.
                                            <br />
                                            <span>A big story.</span>
                                        </>
                                    ) : (
                                        <>
                                            Explore
                                            <br />
                                            <span>
                                                {currentConfig.chemical.trim().split(" (")[0] ||
                                                    "your next story"}
                                                .
                                            </span>
                                        </>
                                    )}
                                </h2>
                                <p>Familiar things, seen from a whole new perspective.</p>
                                <div className="stage-tags">
                                    <span>CHEMISTRY</span>
                                    <span>VISUAL</span>
                                    <span>DISCOVER</span>
                                </div>
                            </div>
                            <LabIllustration />
                            {hasDemoPoster && (
                                <button
                                    type="button"
                                    className="poster-play"
                                    onClick={togglePlay}
                                    aria-label="Play illustration demo"
                                >
                                    <Icon name="play" />
                                </button>
                            )}
                            {playing && (
                                <button
                                    type="button"
                                    className="play-overlay"
                                    onClick={togglePlay}
                                    aria-label="Pause illustration demo"
                                />
                            )}
                            <div className="video-caption">
                                {sections[Math.min(2, Math.floor((elapsed / duration) * 3))]
                                    ?.title || "Illustration demo"}{" "}
                                · Demo
                            </div>
                            <span className="stage-bottom-line" />
                            <span className="demo-watermark">
                                {env.isMock
                                    ? "DESIGN PREVIEW · NO GENERATED VIDEO"
                                    : "YOUR OUTPUT WILL APPEAR HERE"}
                            </span>
                        </div>
                        {hasDemoPoster && (
                            <div className="preview-controls">
                                <button
                                    type="button"
                                    className="icon-button"
                                    onClick={togglePlay}
                                    aria-label={
                                        playing
                                            ? "Pause illustration demo"
                                            : "Play illustration demo"
                                    }
                                >
                                    <Icon name={playing ? "pause" : "play"} />
                                </button>
                                <span className="control-time">{formatTime(elapsed)}</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={duration}
                                    value={elapsed}
                                    onChange={(event) => setElapsed(Number(event.target.value))}
                                    className="timeline"
                                    aria-label="Demo playback progress"
                                />
                                <span className="control-time">{formatTime(duration)}</span>
                                <span className="control-divider" />
                                <button
                                    type="button"
                                    className="icon-button"
                                    aria-label="Preview has no audio"
                                    onClick={() =>
                                        notify(
                                            "The illustration demo has no audio. Use the voice sample button.",
                                        )
                                    }
                                >
                                    <Icon name="mute" />
                                </button>
                                <button
                                    type="button"
                                    className="icon-button"
                                    aria-label="Enter fullscreen"
                                    onClick={() => void fullscreen()}
                                >
                                    <Icon name="expand" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {!video &&
                    result?.artifacts.length === 0 &&
                    job?.status === "completed" && (
                        <p className="preview-note">
                            {result.is_demo
                                ? "Demo complete. This result contains an outline, with no generated media."
                                : "This job has no video artifact. Check the Script tab or output downloads."}
                        </p>
                    )}
            </div>
            <div
                className="tab-panel"
                role="tabpanel"
                id="script-panel"
                aria-labelledby="script-tab"
                hidden={tab !== "script"}
            >
                <div className="script-lines">
                    {sections.map((section, i) => (
                        <div className="script-line" key={`${i}-${section.title}`}>
                            <time>{String(i + 1).padStart(2, "0")}</time>
                            <div>
                                <strong>{section.title}</strong>
                                <br />
                                {section.body}
                            </div>
                        </div>
                    ))}
                </div>
                {!sections.length && (
                    <p>The script will appear after the job completes.</p>
                )}
                {(!result || result.is_demo) && env.isMock && (
                    <p className="tiny" style={{ marginTop: 15 }}>
                        Sample outline only. No chemistry content has been verified.
                    </p>
                )}
            </div>
            <div
                className="tab-panel"
                role="tabpanel"
                id="sources-panel"
                aria-labelledby="sources-tab"
                hidden={tab !== "sources"}
            >
                {result?.sources.length ? (
                    <ul className="source-list">
                        {result.sources.map((source) => (
                            <li key={source.url}>
                                {safeUrl(source.url) ? (
                                    <a href={source.url} target="_blank" rel="noreferrer">
                                        {source.title}
                                        <Icon name="arrow" small />
                                    </a>
                                ) : (
                                    source.title
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>
                        No sources retrieved yet. References will appear here after the
                        research step of the real pipeline.
                    </p>
                )}
            </div>
            <div className="preview-tabs" role="tablist" aria-label="Output details">
                {tabs.map((item, index) => (
                    <button
                        type="button"
                        key={item.id}
                        role="tab"
                        className={`tab ${tab === item.id ? "active" : ""}`}
                        id={`${item.id}-tab`}
                        aria-selected={tab === item.id}
                        aria-controls={`${item.id}-panel`}
                        tabIndex={tab === item.id ? 0 : -1}
                        onClick={() => setTab(item.id)}
                        onKeyDown={(event) => {
                            let next = index;
                            if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
                            else if (event.key === "ArrowLeft")
                                next = (index + tabs.length - 1) % tabs.length;
                            else if (event.key === "Home") next = 0;
                            else if (event.key === "End") next = tabs.length - 1;
                            else return;
                            event.preventDefault();
                            setTab(tabs[next].id);
                            document.getElementById(`${tabs[next].id}-tab`)?.focus();
                        }}
                    >
                        <Icon name={item.icon} />
                        {item.label}
                    </button>
                ))}
                <span className="tabs-spacer" />
                <button
                    type="button"
                    className="export-button"
                    onClick={exportSettings}
                    aria-label="Download settings as JSON"
                >
                    <Icon name="download" />
                    <span>Settings</span>
                </button>
            </div>
            {result && result.artifacts.length > 0 && (
                <div className="artifact-list">
                    {result.artifacts
                        .filter((item) => safeUrl(item.url))
                        .map((item) => (
                            <a
                                key={item.url}
                                href={item.url}
                                download={item.filename}
                                target="_blank"
                                rel="noreferrer"
                                className="text-button"
                            >
                                <Icon name="download" small />
                                {item.filename}
                            </a>
                        ))}
                </div>
            )}
        </section>
    );
}
