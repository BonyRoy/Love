import { useState } from "react";
import { Save } from "lucide-react";
import { Icon } from "../../components/Icon";
import StringListEditor from "./StringListEditor";

export default function SecretHeartEditor({ data, onSave }) {
  const [hint, setHint] = useState(data?.hint ?? "");
  const [final, setFinal] = useState(data?.final ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const saveMeta = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await onSave({ ...data, hint, final, messages: data?.messages ?? [] });
      setStatus("Saved!");
    } catch (err) {
      setStatus(err.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-editor">
      <h1>Secret Heart</h1>

      <form onSubmit={saveMeta} className="admin-object-form">
        <label className="admin-field">
          <span>Hint text</span>
          <input value={hint} onChange={(e) => setHint(e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Final message (use {"{{herName}}"})</span>
          <input value={final} onChange={(e) => setFinal(e.target.value)} />
        </label>
        <button type="submit" className="btn-primary" disabled={saving}>
          <Icon icon={Save} size={16} />
          Save hint & final
        </button>
      </form>

      <hr className="admin-divider" />

      <StringListEditor
        title="Tap messages"
        items={data?.messages ?? []}
        itemLabel="Message"
        onSave={async (messages) => onSave({ ...data, hint, final, messages })}
      />

      {status && <p className="admin-status">{status}</p>}
    </div>
  );
}
