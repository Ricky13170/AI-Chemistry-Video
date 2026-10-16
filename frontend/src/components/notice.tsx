import { useStudio } from "../app/studio-provider";

export function Notice() {
    const { notice } = useStudio();
    return (
        <div
            className={`toast ${notice ? "show" : ""}`}
            role="status"
            aria-live="polite"
        >
            {notice}
        </div>
    );
}
