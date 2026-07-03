import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, RefreshCw } from "lucide-react";
import {
  fetchAdminSettings,
  publishBootstrapConfig,
  updateAdminCredentials,
} from "../supabase/adminService";
import { Icon } from "../components/Icon";

export default function AdminSecurityPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newAdminId, setNewAdminId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchAdminSettings()
      .then((data) => {
        setSettings(data);
        if (data?.admin_id) setNewAdminId(data.admin_id);
      })
      .catch(() => setError("Could not load admin settings."))
      .finally(() => setLoading(false));
  }, []);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const ok = await updateAdminCredentials({
        currentPassword,
        newAdminId,
        newPassword,
      });
      if (!ok) {
        setError("Current password is incorrect.");
        return;
      }
      setMessage("Admin credentials updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      const data = await fetchAdminSettings();
      setSettings(data);
      if (data?.admin_id) setNewAdminId(data.admin_id);
    } catch {
      setError("Could not update credentials.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishBootstrap = async () => {
    setMessage("");
    setError("");
    setPublishing(true);
    try {
      await publishBootstrapConfig();
      setMessage("Bootstrap config synced to secure storage.");
    } catch {
      setError("Could not publish bootstrap config.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <p className="admin-muted">Loading security settings...</p>;
  }

  return (
    <div className="admin-security-page">
      <div className="admin-security-hero">
        <Icon icon={Shield} size={28} />
        <div>
          <h1>Security</h1>
          <p>
            Admin login is stored in Supabase with bcrypt hashing. Session tokens
            expire after 12 hours.
          </p>
        </div>
      </div>

      {message && <p className="admin-success">{message}</p>}
      {error && <p className="admin-error">{error}</p>}

      <section className="admin-security-card">
        <h2>Current admin</h2>
        <p className="admin-muted">
          Login ID: <strong>{settings?.admin_id ?? "—"}</strong>
        </p>
        {settings?.updated_at && (
          <p className="admin-muted">
            Last updated: {new Date(settings.updated_at).toLocaleString()}
          </p>
        )}
      </section>

      <form className="admin-security-card" onSubmit={handleCredentialsSubmit}>
        <h2>Update login</h2>

        <label className="admin-field">
          <span>Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <label className="admin-field">
          <span>New login ID</span>
          <input
            type="text"
            inputMode="numeric"
            value={newAdminId}
            onChange={(e) => setNewAdminId(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="admin-field">
          <span>New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label className="admin-field">
          <span>Confirm new password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <button type="submit" className="btn-primary admin-btn" disabled={saving}>
          {saving ? "Saving..." : "Save credentials"}
        </button>
      </form>

      <section className="admin-security-card">
        <h2>Runtime config</h2>
        <p className="admin-muted">
          Supabase keys are loaded at runtime from the database, not from{" "}
          <code>.env</code>. Publish once after setup so the app can bootstrap
          without bundling secrets.
        </p>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={handlePublishBootstrap}
          disabled={publishing}
        >
          <Icon icon={RefreshCw} size={16} />
          {publishing ? "Publishing..." : "Sync bootstrap config"}
        </button>
        <p className="admin-security-note">
          Or upload <code>supabase/bootstrap-runtime.json</code> to Storage →
          app-bootstrap → runtime.json
        </p>
      </section>

      <Link to="/admin" className="admin-back">
        ← Back to dashboard
      </Link>
    </div>
  );
}
