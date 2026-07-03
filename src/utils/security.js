export function hardenClient() {
  if (import.meta.env.DEV) return;

  const block = (event) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "f12") {
      block(event);
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      if (event.shiftKey && (key === "i" || key === "j" || key === "c")) {
        block(event);
      }
      if (key === "u") {
        block(event);
      }
    }
  });

  const sensitivePatterns = [
    /supabase_anon_key/i,
    /sb_publishable_/i,
    /ishu-admin-token/i,
    /password_hash/i,
  ];

  const originalLog = console.log.bind(console);
  const originalInfo = console.info.bind(console);
  const originalDebug = console.debug.bind(console);

  function scrub(args) {
    return args.map((arg) => {
      if (typeof arg !== "string") return arg;
      return sensitivePatterns.some((pattern) => pattern.test(arg))
        ? "[redacted]"
        : arg;
    });
  }

  console.log = (...args) => originalLog(...scrub(args));
  console.info = (...args) => originalInfo(...scrub(args));
  console.debug = (...args) => originalDebug(...scrub(args));

  Object.defineProperty(window, "__ISHU_SECRETS__", {
    configurable: false,
    enumerable: false,
    get() {
      return undefined;
    },
    set() {
      return false;
    },
  });
}
