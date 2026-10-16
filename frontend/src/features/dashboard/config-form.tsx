import { useState } from "react";
import type { FormEvent } from "react";
import { useStudio } from "../../app/studio-provider";
import { Icon } from "../../components/icon";
import type { IconName } from "../../components/icon";
import { env } from "../../lib/env";
import { jobConfigSchema, outputLabels } from "../jobs/types";
import type { JobConfig } from "../jobs/types";

const compounds = [
    { label: "H₂O", value: "Water (H₂O)" },
    { label: "Ethanol", value: "Ethanol (C₂H₅OH)" },
    { label: "NaCl", value: "Sodium chloride (NaCl)" },
    { label: "CO₂", value: "Carbon dioxide (CO₂)" },
];
const outputs: {
    value: JobConfig["output_type"];
    label: string;
    icon: IconName;
}[] = [
        { value: "video", label: "Video", icon: "video" },
        { value: "slides", label: "Slides", icon: "slides" },
        { value: "script", label: "Script", icon: "file" },
    ];

export function ConfigForm() {
    const { draft, setDraft, busy, canSubmit, submit, notify } = useStudio();
    const [fieldError, setFieldError] = useState<string | null>(null);
    const update = <K extends keyof JobConfig>(key: K, value: JobConfig[K]) =>
        setDraft({ ...draft, [key]: value });

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        const parsed = jobConfigSchema.safeParse(draft);
        if (!parsed.success) {
            setFieldError(parsed.error.issues[0].message);
            return;
        }
        setFieldError(null);
        void submit();
    }
    function previewVoice() {
        if (!("speechSynthesis" in window))
            return notify("System speech is not available in this browser.");
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
            "Discover chemistry, one story at a time.",
        );
        utterance.lang = "en-US";
        utterance.rate = 0.95;
        const voice = window.speechSynthesis
            .getVoices()
            .find((v) => v.lang.toLowerCase().startsWith("en"));
        if (voice) utterance.voice = voice;
        utterance.onerror = () => notify("The system voice could not play.");
        window.speechSynthesis.speak(utterance);
        notify(
            "Playing a system voice sample. The selected provider voice is not connected yet.",
        );
    }
    return (
        <form className="card config" onSubmit={onSubmit} aria-busy={busy}>
            <fieldset disabled={busy} className="config-fields">
                <h2 className="card-title">
                    <span className="number">01</span>Content setup
                </h2>
                <p className="section-copy">
                    Start with a compound you want to explore.
                </p>
                <label className="field-label" htmlFor="chemical">
                    Compound name or formula<span className="required">*</span>
                </label>
                <div className="input-wrap">
                    <input
                        id="chemical"
                        placeholder="e.g. Water, H₂O, Ethanol…"
                        value={draft.chemical}
                        onChange={(event) => {
                            update("chemical", event.target.value);
                            setFieldError(null);
                        }}
                        maxLength={70}
                        required
                        autoComplete="off"
                        aria-describedby={fieldError ? "chemical-error" : "compound-status"}
                        aria-invalid={Boolean(fieldError)}
                    />
                    <Icon name="search" />
                </div>
                {fieldError && (
                    <p className="field-error" id="chemical-error" role="alert">
                        {fieldError}
                    </p>
                )}
                <div className="chips" aria-label="Quick suggestions">
                    {compounds.map((compound) => (
                        <button
                            className="chip"
                            type="button"
                            key={compound.value}
                            onClick={() => {
                                update("chemical", compound.value);
                                setFieldError(null);
                            }}
                        >
                            {compound.label}
                        </button>
                    ))}
                </div>
                <div className="compound-status" id="compound-status">
                    <Icon name="flask" />
                    <span>Enter a compound · identity not verified yet</span>
                </div>
                <div className="divider" />
                <h2 className="card-title" style={{ marginBottom: 17 }}>
                    <span className="number">02</span>Output settings
                </h2>
                <div className="output-options" role="group" aria-label="Output type">
                    {outputs.map((item) => (
                        <button
                            type="button"
                            className={`output-option ${draft.output_type === item.value ? "selected" : ""}`}
                            key={item.value}
                            onClick={() => update("output_type", item.value)}
                            aria-pressed={draft.output_type === item.value}
                        >
                            <Icon name={item.icon} />
                            {item.label}
                        </button>
                    ))}
                </div>
                {draft.output_type !== "script" && (
                    <div className="control-group">
                        <span className="field-label" id="ratio-label">
                            Aspect ratio
                        </span>
                        <div
                            className="segments"
                            role="group"
                            aria-labelledby="ratio-label"
                        >
                            {(["16:9", "9:16", "1:1"] as const).map((value) => (
                                <button
                                    type="button"
                                    key={value}
                                    className={`segment ${draft.aspect_ratio === value ? "selected" : ""}`}
                                    onClick={() => update("aspect_ratio", value)}
                                    aria-pressed={draft.aspect_ratio === value}
                                >
                                    <i
                                        className={`ratio ${value === "9:16" ? "portrait" : value === "1:1" ? "square" : ""}`}
                                    />
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div className="control-group">
                    <label className="field-label" htmlFor="duration">
                        Target duration
                    </label>
                    <select
                        className="select"
                        id="duration"
                        value={draft.duration_seconds}
                        onChange={(event) =>
                            update(
                                "duration_seconds",
                                Number(event.target.value) as JobConfig["duration_seconds"],
                            )
                        }
                    >
                        <option value={30}>30 seconds</option>
                        <option value={60}>60 seconds</option>
                        <option value={90}>90 seconds</option>
                    </select>
                </div>
                <div className="control-group">
                    <label className="field-label" htmlFor="voice">
                        Narration voice
                    </label>
                    <div className="voice-option">
                        <span className="voice-icon">
                            <Icon name="mic" />
                        </span>
                        <select
                            id="voice"
                            value={draft.voice}
                            onChange={(event) =>
                                update("voice", event.target.value as JobConfig["voice"])
                            }
                        >
                            <option value="female">Female · gentle</option>
                            <option value="male">Male · clear</option>
                        </select>
                        <button
                            type="button"
                            className="icon-button"
                            onClick={previewVoice}
                            aria-label="Preview system voice"
                        >
                            <Icon name="play" />
                        </button>
                    </div>
                </div>
                <div className="control-group">
                    <label className="field-label" htmlFor="style">
                        Visual style
                    </label>
                    <select
                        className="select"
                        id="style"
                        value={draft.visual_style}
                        onChange={(event) =>
                            update(
                                "visual_style",
                                event.target.value as JobConfig["visual_style"],
                            )
                        }
                    >
                        <option value="illustration">Scientific illustration</option>
                        <option value="minimal">Clean and minimal</option>
                        <option value="classroom">Visual lesson</option>
                    </select>
                </div>
                <button type="submit" className="create-button" disabled={!canSubmit}>
                    <Icon name="spark" small />
                    <span>
                        {busy
                            ? "Processing…"
                            : `Generate ${outputLabels[draft.output_type]}${env.isMock ? " · demo" : ""}`}
                    </span>
                    <Icon name="arrow" small />
                </button>
            </fieldset>
            <p className="config-footer">
                {env.isMock
                    ? "Mock workflow · no real media generation"
                    : "Submit to the connected chemistry pipeline"}
            </p>
            {env.isMock && (
                <details className="mock-options">
                    <summary>Test a failure scenario</summary>
                    <p>
                        Use <code>fail-demo</code> as the compound to simulate a provider
                        error. Then try Retry or change the compound.
                    </p>
                    <button
                        type="button"
                        className="chip"
                        disabled={busy}
                        onClick={() => update("chemical", "fail-demo")}
                    >
                        Use fail-demo
                    </button>
                </details>
            )}
        </form>
    );
}
