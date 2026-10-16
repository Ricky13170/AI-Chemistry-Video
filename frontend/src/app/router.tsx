import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { AppShell } from "./app-shell";
import { DashboardPage } from "../features/dashboard/dashboard-page";
import { HistoryPage } from "../features/history/history-page";
import { UserPage } from "../features/user/user-page";
import { LoginPage } from "../features/auth/login-page";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppShell />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="user" element={<UserPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route
                        path="*"
                        element={
                            <section className="card route-card">
                                <h1>Page not found</h1>
                                <p>This page does not exist.</p>
                                <Link to="/" className="text-button">
                                    Back to Dashboard
                                </Link>
                            </section>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
