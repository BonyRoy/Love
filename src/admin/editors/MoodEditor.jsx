import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Icon } from "../../components/Icon";

export default function MoodEditor({ title, moods = {}, onSave }) {
  const [data, setData] = useState(moods);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [newKey, setNewKey] = useState("");

  const persist = async (next) => {
    setSaving(true);
    setStatus("");
    try {
      await onSave(next);
      setData(next);
      setStatus("Saved!");
    } catch (err) {
      setStatus(err.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const updateMood = (key, field, value) => {
    setData((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const addMood = () => {
    const key = newKey.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key || data[key]) return;
    setData((prev) => ({
      ...prev,
      [key]: { emoji: "😊", label: key, message: "" },
    }));
    setNewKey("");
  };

  const removeMood = async (key) => {
    const next = { ...data };
    delete next[key];
    await persist(next);
  };

  const saveAll = async () => {
    await persist(data);
  };

  return (
    <div className="admin-editor">
      <h1>{title}</h1>

      <div className="admin-add-row">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="New mood key (e.g. excited)"
        />
        <button type="button" className="btn-secondary" onClick={addMood}>
          <Icon icon={Plus} size={16} />
          Add mood
        </button>
      </div>

      <div className="admin-mood-grid">
        {Object.entries(data).map(([key, mood]) => (
          <div key={key} className="admin-mood-card">
            <div className="admin-mood-card-header">
              <strong>{key}</strong>
              <button type="button" onClick={() => removeMood(key)} aria-label="Delete">
                <Icon icon={Trash2} size={16} />
              </button>
            </div>
            <label className="admin-field">
              <span>Emoji</span>
              <input
                value={mood.emoji}
                onChange={(e) => updateMood(key, "emoji", e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>Label</span>
              <input
                value={mood.label}
                onChange={(e) => updateMood(key, "label", e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>Message</span>
              <textarea
                value={mood.message}
                onChange={(e) => updateMood(key, "message", e.target.value)}
                rows={3}
              />
            </label>
          </div>
        ))}
      </div>

      <button type="button" className="btn-primary admin-save-btn" onClick={saveAll} disabled={saving}>
        <Icon icon={Save} size={16} />
        {saving ? "Saving..." : "Save moods"}
      </button>
      {status && <p className="admin-status">{status}</p>}
    </div>
  );
}
