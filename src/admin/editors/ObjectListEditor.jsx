import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Icon } from "../../components/Icon";

function emptyItem(fields) {
  return Object.fromEntries(
    fields.map((field) => [field.key, field.type === "number" ? 0 : ""]),
  );
}

export default function ObjectListEditor({ title, items = [], fields = [], onSave }) {
  const [list, setList] = useState(items);
  const [editIndex, setEditIndex] = useState(null);
  const [editItem, setEditItem] = useState(null);
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
    const next = [...list, emptyItem(fields)];
    await persist(next);
    setEditIndex(next.length - 1);
    setEditItem(emptyItem(fields));
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditItem({ ...list[index] });
  };

  const saveEdit = async () => {
    const next = [...list];
    const normalized = { ...editItem };
    fields.forEach((field) => {
      if (field.type === "number") {
        normalized[field.key] = Number(normalized[field.key]) || 0;
      }
    });
    next[editIndex] = normalized;
    await persist(next);
    setEditIndex(null);
    setEditItem(null);
  };

  const removeItem = async (index) => {
    const next = list.filter((_, i) => i !== index);
    await persist(next);
    if (editIndex === index) {
      setEditIndex(null);
      setEditItem(null);
    }
  };

  const summary = (item) =>
    fields
      .map((field) => item[field.key])
      .filter(Boolean)
      .join(" · ");

  return (
    <div className="admin-editor">
      <h1>{title}</h1>
      <p className="admin-editor-count">{list.length} items</p>

      <button type="button" className="btn-primary admin-add-btn" onClick={addItem} disabled={saving}>
        <Icon icon={Plus} size={16} />
        Add item
      </button>

      <ul className="admin-list">
        {list.map((item, index) => (
          <li key={index} className="admin-list-item admin-list-item-object">
            {editIndex === index ? (
              <div className="admin-object-form">
                {fields.map((field) => (
                  <label key={field.key} className="admin-field">
                    <span>{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea
                        value={editItem[field.key] ?? ""}
                        onChange={(e) =>
                          setEditItem({ ...editItem, [field.key]: e.target.value })
                        }
                        rows={4}
                      />
                    ) : (
                      <input
                        type={
                          field.type === "number"
                            ? "number"
                            : field.type === "date"
                              ? "date"
                              : "text"
                        }
                        value={editItem[field.key] ?? ""}
                        onChange={(e) =>
                          setEditItem({ ...editItem, [field.key]: e.target.value })
                        }
                      />
                    )}
                  </label>
                ))}
                <div className="admin-edit-actions">
                  <button type="button" className="btn-primary" onClick={saveEdit} disabled={saving}>
                    <Icon icon={Save} size={16} />
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setEditIndex(null);
                      setEditItem(null);
                    }}
                  >
                    <Icon icon={X} size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="admin-list-text">{summary(item) || "Empty item"}</span>
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
