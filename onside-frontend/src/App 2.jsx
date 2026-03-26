import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import AuthModal from "./components/auth/AuthModal";
import Landing from "./pages/landing/Landing";
import Dashboard from "./pages/dashboard/Dashboard";
import BrowsePage from "./pages/browse/BrowsePage";
import EventDetailPage from "./pages/events/EventDetailPage";
import LeagueDetailPage from "./pages/leagues/LeagueDetailPage";
import TeamDetailPage from "./pages/teams/TeamDetailPage";
import CreateEventPage from "./pages/events/CreateEventPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateClubPage from "./pages/clubs/CreateClubPage";
import LeagueRequestPage from "./pages/requests/LeagueRequestPage";
import AdminRequestPage from "./pages/requests/AdminRequestPage";
// ── Route guards ───────────────────────────────────────────────────────────────

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// ── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      {/* AuthModal sits outside Routes so it works on any page */}
      <AuthModal />

      <Routes>
        {/* Landing page — public, redirects to dashboard if already logged in */}
        <Route path="/" element={<Landing />} />

        {/* Dashboard — protected, redirects to landing if not logged in */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Browse — public discovery page */}
        <Route path="/find" element={<BrowsePage />} />

        {/* Events */}
        <Route
          path="/events/new"
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route path="/events/:slug" element={<EventDetailPage />} />

        {/* Leagues — specific routes BEFORE dynamic :slug */}
        <Route path="/leagues/request" element={<LeagueRequestPage />} />
        <Route path="/leagues/:slug" element={<LeagueDetailPage />} />

        {/* Teams */}
        <Route path="/teams/:clubSlug/:teamSlug" element={<TeamDetailPage />} />

        {/* Clubs */}
        <Route path="/clubs/new" element={<CreateClubPage />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/request" element={<AdminRequestPage />} />
      </Routes>
    </>
  );
}
