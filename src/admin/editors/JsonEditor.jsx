import { useState } from "react";
import { Save } from "lucide-react";
import { Icon } from "../../components/Icon";

export default function JsonEditor({ title, value, onSave }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [parseError, setParseError] = useState("");

  const handleSave = async () => {
    setParseError("");
    setStatus("");
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      setParseError("Invalid JSON. Please fix syntax errors.");
      return;
    }
    setSaving(true);
    try {
      await onSave(parsed);
      setText(JSON.stringify(parsed, null, 2));
      setStatus("Saved!");
    } catch (err) {
      setStatus(err.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-editor">
      <h1>{title}</h1>
      <p className="admin-editor-hint">
        Edit as JSON. Be careful with commas and brackets.
      </p>
      <textarea
        className="admin-json-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={24}
        spellCheck={false}
      />
      {parseError && <p className="admin-error">{parseError}</p>}
      <button type="button" className="btn-primary admin-save-btn" onClick={handleSave} disabled={saving}>
        <Icon icon={Save} size={16} />
        {saving ? "Saving..." : "Save JSON"}
      </button>
      {status && <p className="admin-status">{status}</p>}
    </div>
  );
}
