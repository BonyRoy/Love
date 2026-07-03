import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Icon } from "../../components/Icon";

function emptyQuestion() {
  return { question: "", options: ["", "", "", ""], answer: 0 };
}

export default function QuizEditor({ title, items = [], onSave }) {
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
    const next = [...list, emptyQuestion()];
    await persist(next);
    setEditIndex(next.length - 1);
    setEditItem(emptyQuestion());
  };

  const saveEdit = async () => {
    const next = [...list];
    next[editIndex] = {
      ...editItem,
      answer: Number(editItem.answer) || 0,
      options: editItem.options.map((o) => o.trim()).filter(Boolean),
    };
    await persist(next);
    setEditIndex(null);
    setEditItem(null);
  };

  const removeItem = async (index) => {
    const next = list.filter((_, i) => i !== index);
    await persist(next);
    setEditIndex(null);
  };

  return (
    <div className="admin-editor">
      <h1>{title}</h1>
      <button type="button" className="btn-primary admin-add-btn" onClick={addItem} disabled={saving}>
        <Icon icon={Plus} size={16} />
        Add question
      </button>

      <ul className="admin-list">
        {list.map((item, index) => (
          <li key={index} className="admin-list-item admin-list-item-object">
            {editIndex === index ? (
              <div className="admin-object-form">
                <label className="admin-field">
                  <span>Question</span>
                  <textarea
                    value={editItem.question}
                    onChange={(e) => setEditItem({ ...editItem, question: e.target.value })}
                    rows={2}
                  />
                </label>
                {editItem.options.map((opt, optIndex) => (
                  <label key={optIndex} className="admin-field">
                    <span>Option {optIndex + 1}</span>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const options = [...editItem.options];
                        options[optIndex] = e.target.value;
                        setEditItem({ ...editItem, options });
                      }}
                    />
                  </label>
                ))}
                <label className="admin-field">
                  <span>Correct answer index (0-based)</span>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={editItem.answer}
                    onChange={(e) =>
                      setEditItem({ ...editItem, answer: Number(e.target.value) })
                    }
                  />
                </label>
                <div className="admin-edit-actions">
                  <button type="button" className="btn-primary" onClick={saveEdit} disabled={saving}>
                    <Icon icon={Save} size={16} />
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setEditIndex(null)}
                  >
                    <Icon icon={X} size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="admin-list-text">{item.question}</span>
                <div className="admin-list-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditIndex(index);
                      setEditItem({
                        ...item,
                        options: [...(item.options ?? []), "", "", ""].slice(0, 4),
                      });
                    }}
                  >
                    <Icon icon={Pencil} size={16} />
                  </button>
                  <button type="button" onClick={() => removeItem(index)}>
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
