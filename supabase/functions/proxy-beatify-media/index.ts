const ALLOWED_HOST = "firebasestorage.googleapis.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const remoteUrl = new URL(req.url).searchParams.get("url");
  if (!remoteUrl) {
    return new Response("missing url", { status: 400, headers: corsHeaders });
  }

  let parsed: URL;
  try {
    parsed = new URL(remoteUrl);
  } catch {
    return new Response("invalid url", { status: 400, headers: corsHeaders });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new Response("host not allowed", { status: 403, headers: corsHeaders });
  }

  const upstream = await fetch(remoteUrl);
  if (!upstream.ok) {
    return new Response("upstream failed", {
      status: upstream.status,
      headers: corsHeaders,
    });
  }

  return new Response(upstream.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": upstream.headers.get("Content-Type") || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
});
