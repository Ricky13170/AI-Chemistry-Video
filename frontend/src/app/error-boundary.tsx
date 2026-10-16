import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

export class ErrorBoundary extends Component<
    { children: ReactNode },
    { failed: boolean }
> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Studio rendering error", error, info.componentStack);
    }
    render() {
        if (this.state.failed)
            return (
                <main className="startup-error">
                    <h1>Something went wrong.</h1>
                    <p>Reload the app to try again.</p>
                    <button onClick={() => window.location.reload()}>Reload</button>
                </main>
            );
        return this.props.children;
    }
}
