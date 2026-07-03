import { useState, useEffect } from "react";
import { ListTodo } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

function loadChecked(storageKey) {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function BucketListPage() {
  const { bucketList, storageKeys } = useContent();
  const storageKey = storageKeys.bucketList;
  const [checked, setChecked] = useState(() => loadChecked(storageKey));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      // ignore
    }
  }, [checked, storageKey]);

  const toggle = (index) => {
    setChecked((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const done = checked.length;
  const total = bucketList.length;

  return (
    <div className="page">
      <div className="page-hero">
        <Icon icon={ListTodo} size={32} className="page-hero-icon" />
        <h1>Our Bucket List</h1>
        <p>
          {done} of {total} adventures done — let's make more memories.
        </p>
      </div>

      <div className="bucket-progress">
        <div
          className="bucket-progress-bar"
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </div>

      <ul className="bucket-list">
        {bucketList.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              className={`bucket-item ${checked.includes(i) ? "done" : ""}`}
              onClick={() => toggle(i)}
            >
              <span className="bucket-check">
                {checked.includes(i) ? "✓" : ""}
              </span>
              <span className="bucket-text">{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
