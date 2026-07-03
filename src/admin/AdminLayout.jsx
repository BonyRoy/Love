import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, Database } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useContent } from "../context/ContentContext";
import { Icon } from "../components/Icon";
import { isSupabaseConfigured } from "../supabase/config";

export function ProtectedAdminRoute() {
  const { isAdmin, checking } = useAdminAuth();
  if (checking) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <p>Checking session...</p>
        </div>
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const { usingSupabase } = useContent();
  const location = useLocation();
  const supabaseReady = isSupabaseConfigured();
  const isChat = location.pathname === "/admin/chat";

  if (isChat) {
    return <Outlet />;
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-left">
          <Link to="/admin" className="admin-brand">
            <Icon icon={LayoutDashboard} size={22} />
            Admin Panel
          </Link>
          <span
            className={`admin-badge ${supabaseReady && usingSupabase ? "ok" : "warn"}`}
          >
            <Icon icon={Database} size={14} />
            {supabaseReady ? "Supabase connected" : "Supabase not configured"}
          </span>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin/chat" className="admin-link admin-chat-link">
            Chat
          </Link>
          <Link to="/admin/security" className="admin-link">
            Security
          </Link>
          <Link to="/home" className="admin-link">
            View app
          </Link>
          <button type="button" className="admin-logout" onClick={logout}>
            <Icon icon={LogOut} size={16} />
            Logout
          </button>
        </div>
      </header>

      {!supabaseReady && (
        <div className="admin-banner admin-banner-warn">
          App config could not be loaded. Run <code>supabase/admin.sql</code> and
          upload <code>bootstrap-runtime.json</code> to the app-bootstrap bucket.
        </div>
      )}

      {location.pathname === "/admin" ? (
        <Outlet />
      ) : (
        <div className="admin-body">
          <Link to="/admin" className="admin-back">
            ← All sections
          </Link>
          <Outlet />
        </div>
      )}
    </div>
  );
}
