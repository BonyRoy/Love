import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Icon } from "../components/Icon";

const REMEMBER_KEY = "ishu-admin-remember";

function readRemembered() {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.id && parsed?.password) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveRemembered(id, password) {
  localStorage.setItem(REMEMBER_KEY, JSON.stringify({ id, password }));
}

function clearRemembered() {
  localStorage.removeItem(REMEMBER_KEY);
}

export default function AdminLoginPage() {
  const { login, isAdmin, checking } = useAdminAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = readRemembered();
    if (saved) {
      setId(saved.id);
      setPassword(saved.password);
      setRememberMe(true);
    }
  }, []);

  if (checking) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <p>Checking session...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const ok = await login(id, password);
      if (!ok) {
        setError("Invalid login ID or password.");
        return;
      }

      if (rememberMe) {
        saveRemembered(id.trim(), password);
      } else {
        clearRemembered();
      }
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <Icon icon={Lock} size={32} className="admin-login-icon" />
        <h1>Admin Login</h1>
        <p>Manage app content for Ishu</p>

        {error && <p className="admin-error">{error}</p>}

        <label className="admin-field">
          <span>Login ID</span>
          <input
            type="text"
            inputMode="numeric"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter login ID"
            autoComplete="username"
            required
          />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />
        </label>

        <label className="admin-remember">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => {
              const checked = e.target.checked;
              setRememberMe(checked);
              if (!checked) clearRemembered();
            }}
          />
          <span>Remember me</span>
        </label>

        <button type="submit" className="btn-primary admin-btn" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
