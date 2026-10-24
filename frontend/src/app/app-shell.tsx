import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Icon } from "../components/icon";
import type { IconName } from "../components/icon";
import { Notice } from "../components/notice";
import { useStudio } from "./studio-provider";
import { env } from "../lib/env";

const links: { to: string; label: string; icon: IconName }[] = [
    { to: "/", label: "Dashboard", icon: "grid" },
    { to: "/history", label: "History", icon: "history" },
    { to: "/user", label: "Account", icon: "user" },
    { to: "/login", label: "Log in", icon: "login" },
];

export function AppShell() {
    const { pathname } = useLocation();
    const { totalJobs, notify, busy } = useStudio();
    const [menuOpen, setMenuOpen] = useState(false);
    const title = links.find((x) => x.to === pathname)?.label || "Not found";
    useEffect(() => {
        setMenuOpen(false);
        document.title = `${title} · Chemistry Studio`;
    }, [pathname, title]);
    useEffect(() => {
        const close = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("keydown", close);
        return () => document.removeEventListener("keydown", close);
    }, []);
    return (
        <div className="app">
            {menuOpen && (
                <button
                    type="button"
                    className="menu-backdrop visible"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close navigation"
                />
            )}
            <aside
                className={`sidebar ${menuOpen ? "open" : ""}`}
                id="main-navigation"
                aria-label="Main navigation"
            >
                <Link to="/" className="brand" aria-label="Chemistry Studio home">
                    <div className="brand-mark">
                        <Icon name="flask" />
                    </div>
                    <div>
                        <strong className="sidebar__brand-title">Chemistry</strong>
                        <span className="sidebar__brand-sub">VIDEO STUDIO</span>
                    </div>
                </Link>
                <div className="nav-label">WORKSPACE</div>
                <nav className="nav">
                    {links.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                `nav-link nav-item ${isActive ? "active nav-item--active" : ""}`
                            }
                            title={item.label}
                        >
                            <Icon name={item.icon} />
                            <span>{item.label}</span>
                            {item.to === "/history" && (
                                <small className="nav-count">{totalJobs}</small>
                            )}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-bottom">
                    <div className="lab-note">
                        <Icon name="flask" />
                        <strong>One compound. One story.</strong>
                        <p>
                            Bring chemistry to life,
                            <br />
                            one visual lesson at a time.
                        </p>
                        {busy && <p className="nav-running">A job is running…</p>}
                    </div>
                    <Link to="/user" className="side-profile">
                        <div className="avatar">G</div>
                        <div>
                            <strong>Personal workspace</strong>
                            <small>Guest workspace</small>
                        </div>
                        <Icon name="arrow" small />
                    </Link>
                </div>
            </aside>
            <main className="main" id="main-content">
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="icon-button mobile-menu"
                            aria-expanded={menuOpen}
                            aria-controls="main-navigation"
                            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                            onClick={() => setMenuOpen((x) => !x)}
                        >
                            <Icon name="menu" />
                        </button>
                        <div className="breadcrumbs">
                            Workspace <span>/</span>
                            <strong>{title}</strong>
                        </div>
                    </div>
                    <div className="top-actions">
                        <span className="version">
                            <i className="status-dot" />
                            {env.isMock ? "MOCK API" : "LIVE API"}
                        </span>
                        <button
                            type="button"
                            className="icon-button"
                            aria-label="Help"
                            onClick={() =>
                                notify(
                                    "Choose a compound and output, then Generate. History keeps your jobs. Reset settings restores the form without deleting history.",
                                )
                            }
                        >
                            <Icon name="help" />
                        </button>
                        <Link
                            to="/user"
                            className="avatar"
                            aria-label="Account"
                            style={{ width: 30, height: 30, borderRadius: "50%" }}
                        >
                            G
                        </Link>
                    </div>
                </header>
                <div className="page">
                    <Outlet />
                    <footer className="footer">
                        <span>
                            <Icon name="flask" />
                            AI Chemistry Video · Chemistry Studio
                        </span>
                        <span>
                            {env.isMock
                                ? "Demo workflow · no generated media"
                                : "Connected to API"}
                        </span>
                    </footer>
                </div>
            </main>
            <Notice />
        </div>
    );
}
