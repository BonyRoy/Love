function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  );
}

function blockUnlessEditable(event) {
  if (!isEditableTarget(event.target)) {
    event.preventDefault();
  }
}

function blockClipboardShortcuts(event) {
  if (isEditableTarget(event.target)) return;
  const key = event.key.toLowerCase();
  if (event.ctrlKey || event.metaKey) {
    if (key === "c" || key === "x" || key === "v" || key === "a") {
      event.preventDefault();
    }
  }
}

function blockPinchZoom(event) {
  if (event.ctrlKey) {
    event.preventDefault();
  }
}

function blockInspectShortcuts(event) {
  const key = event.key.toLowerCase();
  if (key === "f12") {
    event.preventDefault();
    return;
  }
  if (event.ctrlKey || event.metaKey) {
    if (event.shiftKey && (key === "i" || key === "j" || key === "c")) {
      event.preventDefault();
    }
    if (key === "u") {
      event.preventDefault();
    }
  }
}

export function enablePageProtection() {
  document.addEventListener("copy", blockUnlessEditable);
  document.addEventListener("cut", blockUnlessEditable);
  document.addEventListener("paste", blockUnlessEditable);
  document.addEventListener("contextmenu", blockUnlessEditable);
  document.addEventListener("selectstart", blockUnlessEditable);
  document.addEventListener("keydown", blockClipboardShortcuts);
  document.addEventListener("keydown", blockInspectShortcuts);
  document.addEventListener("wheel", blockPinchZoom, { passive: false });
}
