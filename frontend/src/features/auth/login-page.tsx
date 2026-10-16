import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../components/icon";

export function LoginPage() {
    const [previewed, setPreviewed] = useState(false);
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        event.currentTarget.reset();
        setPreviewed(true);
    }
    return (
        <div className="login-layout">
            <div className="login-intro">
                <p className="eyebrow">
                    <Icon name="flask" small />
                    CHEMISTRY VIDEO STUDIO
                </p>
                <h1>
                    Welcome back,
                    <br />
                    curious mind.
                </h1>
                <p>
                    One compound can be the beginning
                    <br />
                    of a great story.
                </p>
                <div className="login-orbit" aria-hidden="true">
                    <span>H₂O</span>
                    <i />
                    <b />
                </div>
            </div>
            <section className="card login-card">
                <span className="pill">Planned · UI preview</span>
                <h2>Log in to your workspace</h2>
                <p>Authentication will be connected in a later step.</p>
                <form onSubmit={submit}>
                    <label className="field-label" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="select"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                    />
                    <label className="field-label" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="select"
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter a sample password"
                        required
                        autoComplete="off"
                    />
                    <button className="create-button" type="submit">
                        Preview sign-in
                        <Icon name="arrow" small />
                    </button>
                </form>
                {previewed && (
                    <p className="modal-note" role="status">
                        This is a layout preview. No credentials were sent or saved, and you
                        are still a guest.
                    </p>
                )}
                <Link to="/" className="inline-link">
                    Back to the studio
                    <Icon name="arrow" small />
                </Link>
            </section>
        </div>
    );
}
