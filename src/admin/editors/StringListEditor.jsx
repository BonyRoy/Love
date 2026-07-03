import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Icon } from "../../components/Icon";

export default function StringListEditor({
  title,
  items = [],
  itemLabel = "Item",
  onSave,
}) {
  const [list, setList] = useState(items);
  const [draft, setDraft] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const persist = async (next) => {
    setSaving(true);
    setStatus("");
    try {
      await onSave(next);
      setList(next);
      setStatus("Saved!");
    } catch (err) {
      setStatus(err.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const addItem = async () => {
    const value = draft.trim();
    if (!value) return;
    const next = [...list, value];
    await persist(next);
    setDraft("");
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditValue(list[index]);
  };

  const saveEdit = async () => {
    const value = editValue.trim();
    if (!value) return;
    const next = [...list];
    next[editIndex] = value;
    await persist(next);
    setEditIndex(null);
    setEditValue("");
  };

  const removeItem = async (index) => {
    const next = list.filter((_, i) => i !== index);
    await persist(next);
    if (editIndex === index) setEditIndex(null);
  };

  return (
    <div className="admin-editor">
      <h1>{title}</h1>
      <p className="admin-editor-count">{list.length} items</p>

      <div className="admin-add-row">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`New ${itemLabel.toLowerCase()}...`}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <button type="button" className="btn-primary" onClick={addItem} disabled={saving}>
          <Icon icon={Plus} size={16} />
          Add
        </button>
      </div>

      <ul className="admin-list">
        {list.map((item, index) => (
          <li key={`${index}-${item.slice(0, 12)}`} className="admin-list-item">
            {editIndex === index ? (
              <div className="admin-edit-row">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={3}
                />
                <div className="admin-edit-actions">
                  <button type="button" className="btn-primary" onClick={saveEdit} disabled={saving}>
                    <Icon icon={Save} size={16} />
                    Save
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setEditIndex(null)}>
                    <Icon icon={X} size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="admin-list-text">{item}</span>
                <div className="admin-list-actions">
                  <button type="button" onClick={() => startEdit(index)} aria-label="Edit">
                    <Icon icon={Pencil} size={16} />
                  </button>
                  <button type="button" onClick={() => removeItem(index)} aria-label="Delete">
                    <Icon icon={Trash2} size={16} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {status && <p className="admin-status">{status}</p>}
    </div>
  );
}
