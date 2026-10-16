import { Link } from "react-router-dom";
import { Icon } from "../../components/icon";

export function UserPage() {
    return (
        <>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">
                        <Icon name="user" small />
                        YOUR WORKSPACE
                    </p>
                    <h1>A space for your stories.</h1>
                    <p className="subtitle">
                        Your profile and preferences will live here.
                    </p>
                </div>
            </div>
            <section className="card route-card">
                <div className="profile-hero">
                    <div className="avatar">G</div>
                    <div>
                        <h2>Guest workspace</h2>
                        <p>Explore Chemistry Studio before connecting an account.</p>
                    </div>
                </div>
                <div className="modal-note">
                    Account management is planned for a later screen. Authentication is
                    not connected yet.
                </div>
                <div className="schema">
                    <div>
                        <span>Workspace</span>
                        <strong>Personal</strong>
                    </div>
                    <div>
                        <span>Session</span>
                        <strong>Guest</strong>
                    </div>
                    <div>
                        <span>Preferences</span>
                        <strong>Not configured</strong>
                    </div>
                </div>
                <Link to="/login" className="text-button" style={{ marginTop: 24 }}>
                    View login screen
                    <Icon name="arrow" small />
                </Link>
            </section>
        </>
    );
}
