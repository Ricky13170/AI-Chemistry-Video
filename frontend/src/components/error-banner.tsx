import { Icon } from "./icon";

export function ErrorBanner({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <div className="error-banner" role="alert">
            <span>{message}</span>
            {onRetry && (
                <button type="button" onClick={onRetry}>
                    <Icon name="reset" small />
                    Try again
                </button>
            )}
        </div>
    );
}
