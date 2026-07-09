export function getBearerToken(req) {
  const header = req.headers?.authorization ?? req.headers?.Authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

async function getSupabaseAnonKey() {
  const fromEnv =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (fromEnv) return fromEnv;

  const projectRef = process.env.VITE_SUPABASE_PROJECT_REF || "rfkfctipgahysdysctea";
  const response = await fetch(
    `https://${projectRef}.supabase.co/storage/v1/object/public/app-bootstrap/runtime.json`,
    { cache: "no-store" },
  );
  if (!response.ok) return null;

  const data = await response.json();
  return data.supabase_anon_key ?? null;
}

export async function validateAdminToken(token) {
  if (!token) return false;

  const projectRef = process.env.VITE_SUPABASE_PROJECT_REF || "rfkfctipgahysdysctea";
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL || `https://${projectRef}.supabase.co`;
  const anonKey = await getSupabaseAnonKey();
  if (!anonKey) return false;

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/admin_validate_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ p_token: token }),
  });

  if (!response.ok) return false;
  const data = await response.json();
  return Boolean(data);
}

export async function requireAdmin(req) {
  const token = getBearerToken(req);
  const valid = await validateAdminToken(token);
  if (!valid) {
    const error = new Error("Admin sign-in required.");
    error.statusCode = 401;
    throw error;
  }
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}
