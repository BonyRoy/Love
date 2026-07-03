import { encodeEnvelope, decodeEnvelope } from "../utils/secureTransport.js";

const GATEWAY_RPC = "secure_gateway";
const RAW_FETCH = globalThis.fetch.bind(globalThis);

const SECURE_RPCS = new Set([
  "admin_login",
  "admin_validate_token",
  "admin_logout",
  "admin_get_settings",
  "admin_update_credentials",
  "admin_save_content",
  "admin_update_runtime_config",
  "get_runtime_config",
  "cleanup_old_chat_messages",
]);

const SECURE_TABLES = new Set(["app_content", "chat_messages"]);

function isSupabaseHost(hostname) {
  return hostname.endsWith(".supabase.co");
}

function headerGet(headers, name) {
  if (!headers) return null;
  if (headers instanceof Headers) return headers.get(name);
  const key = Object.keys(headers).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  return key ? headers[key] : null;
}

function buildHeaders(init, url) {
  const apikey =
    headerGet(init?.headers, "apikey") || url.searchParams.get("apikey");
  const authorization = headerGet(init?.headers, "Authorization");

  return {
    "Content-Type": "application/json",
    apikey,
    Authorization: authorization || (apikey ? `Bearer ${apikey}` : undefined),
    Prefer: headerGet(init?.headers, "Prefer") || undefined,
    Accept: headerGet(init?.headers, "Accept") || "application/json",
  };
}

function parsePostgrestQuery(searchParams) {
  const query = {
    select: searchParams.get("select") || "*",
    filters: [],
    single: false,
  };

  const order = searchParams.get("order");
  if (order) {
    const [col, dir] = order.split(".");
    if (col) {
      query.order = { col, asc: dir !== "desc" };
    }
  }

  const limit = searchParams.get("limit");
  if (limit) {
    query.limit = limit;
  }

  for (const [key, value] of searchParams.entries()) {
    if (["select", "order", "limit", "accept", "apikey"].includes(key)) continue;

    if (value === "not.is.null") {
      query.filters.push({ col: key, op: "not.is", val: "null" });
      continue;
    }

    const dot = value.indexOf(".");
    if (dot > 0) {
      query.filters.push({
        col: key,
        op: value.slice(0, dot),
        val: value.slice(dot + 1),
      });
    } else {
      query.filters.push({ col: key, op: "eq", val: value });
    }
  }

  return query;
}

async function invokeGateway(origin, init, envelopePayload) {
  const url = new URL(`${origin}/rest/v1/rpc/${GATEWAY_RPC}`);
  const headers = buildHeaders(init, url);

  const response = await RAW_FETCH(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({
      p_envelope: encodeEnvelope(envelopePayload),
    }),
  });

  if (!response.ok) {
    return response;
  }

  const encoded = await response.json();
  const b64 = typeof encoded === "string" ? encoded : String(encoded ?? "");
  const decoded = decodeEnvelope(b64);

  const body =
    decoded === null || decoded === undefined
      ? "null"
      : typeof decoded === "string"
        ? JSON.stringify(decoded)
        : JSON.stringify(decoded);

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleRpc(url, init) {
  const fnName = url.pathname.split("/").pop();
  if (fnName === GATEWAY_RPC) {
    return RAW_FETCH(url.toString(), init);
  }

  if (!SECURE_RPCS.has(fnName)) {
    return RAW_FETCH(url.toString(), init);
  }

  const args = init?.body ? JSON.parse(init.body) : {};

  return invokeGateway(url.origin, init, {
    type: "rpc",
    name: fnName,
    args,
  });
}

async function handleTableRest(url, init) {
  const table = url.pathname.split("/").pop()?.split("?")[0];
  if (!SECURE_TABLES.has(table)) {
    return RAW_FETCH(url.toString(), init);
  }

  const method = (init?.method || "GET").toUpperCase();
  const query = parsePostgrestQuery(url.searchParams);
  const prefer = headerGet(init?.headers, "Prefer");
  const accept = headerGet(init?.headers, "Accept");
  const body = init?.body ? JSON.parse(init.body) : null;

  if (prefer?.includes("return=representation")) {
    query.returning = true;
  }
  if (accept?.includes("vnd.pgrst.object")) {
    query.single = true;
  }

  return invokeGateway(url.origin, init, {
    type: "rest",
    method,
    table,
    query,
    body,
    prefer,
    accept,
  });
}

export function createSecureFetch() {
  return async function secureFetch(input, init = {}) {
    const url = new URL(typeof input === "string" ? input : input.url);

    if (!isSupabaseHost(url.hostname)) {
      return RAW_FETCH(input, init);
    }

    if (
      url.pathname.includes("/realtime/") ||
      url.pathname.startsWith("/storage/v1/")
    ) {
      return RAW_FETCH(input, init);
    }

    if (url.pathname.includes("/rest/v1/rpc/")) {
      return handleRpc(url, init);
    }

    const tableMatch = url.pathname.match(/\/rest\/v1\/([^/?]+)/);
    if (tableMatch) {
      return handleTableRest(url, init);
    }

    return RAW_FETCH(input, init);
  };
}
