import { useState } from "react";
import { isIosDevice } from "../utils/beatifyLaunch";

export default function BeatifyIosHint({ href, onClose }) {
  return (
    <div className="beatify-hint-backdrop" role="presentation" onClick={onClose}>
      <div
        className="beatify-hint-modal"
        role="dialog"
        aria-labelledby="beatify-hint-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="beatify-hint-title">Open Beatify</h3>
        <p>
          iPhone can&apos;t open another Home Screen app from a link. If you installed
          Beatify, tap its icon on your Home Screen.
        </p>
        <div className="beatify-hint-actions">
          <a href={href} className="btn-primary beatify-hint-open">
            Open in browser
          </a>
          <button type="button" className="beatify-hint-dismiss" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export function useBeatifyIosHint(href) {
  const [showHint, setShowHint] = useState(false);
  const needsHint = Boolean(href) && isIosDevice();

  const onClick = (event) => {
    if (!needsHint) return;
    event.preventDefault();
    setShowHint(true);
  };

  const hint = showHint ? (
    <BeatifyIosHint href={href} onClose={() => setShowHint(false)} />
  ) : null;

  return { onClick: needsHint ? onClick : undefined, hint };
}
