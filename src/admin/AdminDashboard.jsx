import { Link } from "react-router-dom";
import { MessageCircle, Shield } from "lucide-react";
import { getSectionsByCategory } from "./sections";
import { hasContent } from "../supabase/contentService";
import { isSupabaseConfigured } from "../supabase/config";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const groups = getSectionsByCategory();
  const [contentReady, setContentReady] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setContentReady(false);
      return;
    }
    hasContent()
      .then(setContentReady)
      .catch(() => setContentReady(false));
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-hero">
        <h1>Content Manager</h1>
        <p>Add, edit, or delete app content. Changes sync live to the app.</p>

        {isSupabaseConfigured() && contentReady === false && (
          <div className="admin-banner admin-banner-warn">
            No content in database yet. Open Supabase → SQL Editor → run{" "}
            <code>supabase/seed.sql</code> to upload your full JSON.
          </div>
        )}

        {isSupabaseConfigured() && contentReady === true && (
          <p className="admin-seed-status">Content loaded from Supabase.</p>
        )}

        <Link to="/admin/chat" className="admin-chat-card">
          <MessageCircle size={28} />
          <div>
            <h3>Private Chat</h3>
            <p>Read and reply to Ishu&apos;s messages & photos</p>
          </div>
        </Link>

        <Link to="/admin/security" className="admin-chat-card admin-security-card-link">
          <Shield size={28} />
          <div>
            <h3>Security</h3>
            <p>Update admin login and sync runtime config</p>
          </div>
        </Link>
      </div>

      {Object.entries(groups).map(([category, sections]) => (
        <section key={category} className="admin-category">
          <h2>{category}</h2>
          <div className="admin-section-grid">
            {sections.map((section) => (
              <Link
                key={section.id}
                to={`/admin/sections/${section.id}`}
                className="admin-section-card"
              >
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
