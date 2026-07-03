import { useState } from "react";
import { Save } from "lucide-react";
import { Icon } from "../../components/Icon";

export default function MetaEditor({ raw, onSave }) {
  const [form, setForm] = useState({
    meta: { ...raw.meta },
    landing: { ...raw.landing },
    layout: { ...raw.layout },
    daysHero: { ...raw.daysHero },
    ourSong: { ...raw.ourSong },
    gamesPage: { ...raw.gamesPage },
    home: { ...raw.home },
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const setField = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await onSave(form);
      setStatus("Saved!");
    } catch (err) {
      setStatus(err.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-editor admin-meta-form" onSubmit={handleSave}>
      <h1>Names & App Info</h1>

      <fieldset className="admin-fieldset">
        <legend>Names & dates</legend>
        <label className="admin-field">
          <span>Her name</span>
          <input
            value={form.meta.herName}
            onChange={(e) => setField("meta", "herName", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Your name</span>
          <input
            value={form.meta.yourName}
            onChange={(e) => setField("meta", "yourName", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Start date (YYYY-MM-DD)</span>
          <input
            value={form.meta.ourStartDate}
            onChange={(e) => setField("meta", "ourStartDate", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>App title</span>
          <input
            value={form.meta.appTitle}
            onChange={(e) => setField("meta", "appTitle", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>App description</span>
          <textarea
            value={form.meta.appDescription}
            onChange={(e) => setField("meta", "appDescription", e.target.value)}
            rows={2}
          />
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Landing page</legend>
        <label className="admin-field">
          <span>Eyebrow</span>
          <input
            value={form.landing.eyebrow}
            onChange={(e) => setField("landing", "eyebrow", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Subtitle (use {"{{yourName}}"})</span>
          <input
            value={form.landing.subtitle}
            onChange={(e) => setField("landing", "subtitle", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Button text</span>
          <input
            value={form.landing.cta}
            onChange={(e) => setField("landing", "cta", e.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Home hero</legend>
        <label className="admin-field">
          <span>Greeting (use {"{{herName}}"})</span>
          <input
            value={form.daysHero.greeting}
            onChange={(e) => setField("daysHero", "greeting", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Subtitle</span>
          <input
            value={form.daysHero.subtitle}
            onChange={(e) => setField("daysHero", "subtitle", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Days label (use {"{{herName}}"})</span>
          <input
            value={form.daysHero.daysLabel}
            onChange={(e) => setField("daysHero", "daysLabel", e.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Our song</legend>
        <label className="admin-field">
          <span>Beatify track UUID</span>
          <input
            value={form.ourSong.beatifyUuid ?? ""}
            onChange={(e) => setField("ourSong", "beatifyUuid", e.target.value)}
            placeholder="Paste UUID from Beatify admin"
            spellCheck={false}
          />
        </label>
        <p className="admin-field-hint">
          Upload the track in Beatify, copy its UUID, and paste it here. Title,
          artist, album, and MP3 cover art load from Beatify automatically.
        </p>
        <label className="admin-field">
          <span>Title (optional override)</span>
          <input
            value={form.ourSong.title}
            onChange={(e) => setField("ourSong", "title", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Artist (optional override)</span>
          <input
            value={form.ourSong.artist}
            onChange={(e) => setField("ourSong", "artist", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Card title (shown above the track)</span>
          <textarea
            value={form.ourSong.note}
            onChange={(e) => setField("ourSong", "note", e.target.value)}
            rows={2}
            placeholder="This song reminds me of you."
          />
        </label>
      </fieldset>

      <button type="submit" className="btn-primary admin-save-btn" disabled={saving}>
        <Icon icon={Save} size={16} />
        {saving ? "Saving..." : "Save all settings"}
      </button>
      {status && <p className="admin-status">{status}</p>}
    </form>
  );
}
