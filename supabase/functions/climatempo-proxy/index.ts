import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://xukfebfmifhbnvcmnbrg.supabase.co",
  "https://*.lovableproject.com",
];

const getOrigin = (req: Request): string => {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed.replace(/\*/g, "")))) {
    return origin;
  }
  return ALLOWED_ORIGINS[0];
};

const buildCorsHeaders = (req: Request) => ({
  "Access-Control-Allow-Origin": getOrigin(req),
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const BASE_URL = "https://apiadvisor.climatempo.com.br/api/v1";

const VALID_ENDPOINTS = new Set(["current", "hours72", "days15", "history"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

serve(async (req) => {
  const headers = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const { endpoint, locationCode, params } = await req.json();

    // --- Input validation ---

    // Validate endpoint
    if (!endpoint || !VALID_ENDPOINTS.has(endpoint)) {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Validate locationCode: must be a positive integer
    const code = Number(locationCode);
    if (!Number.isInteger(code) || code <= 0 || code > 9_999_999) {
      return new Response(
        JSON.stringify({ error: "Invalid locationCode" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Validate fromDate if provided (ISO date only, no injection)
    const rawFromDate = params?.fromDate;
    const safeFromDate =
      typeof rawFromDate === "string" && DATE_PATTERN.test(rawFromDate)
        ? rawFromDate
        : "2024-01-01";

    // --- Token setup ---

    const sanitizeToken = (value: string | undefined) =>
      value?.trim().replace(/^['"]|['"]$/g, "");

    const FORECAST_TOKEN = sanitizeToken(Deno.env.get("CLIMATEMPO_FORECAST_TOKEN"));
    const HISTORY_TOKEN = sanitizeToken(Deno.env.get("CLIMATEMPO_HISTORY_TOKEN"));

    if (!FORECAST_TOKEN || !HISTORY_TOKEN) {
      console.error("CLIMATEMPO tokens not configured in environment");
      return new Response(
        JSON.stringify({ error: "API_CONFIG_MISSING", message: "Tokens climáticos não configurados. Contate o administrador." }),
        { status: 503, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // --- Build URL with validated inputs ---

    let url: string;

    switch (endpoint) {
      case "current":
        url = `${BASE_URL}/weather/locale/${code}/current?token=${encodeURIComponent(FORECAST_TOKEN)}`;
        break;
      case "hours72":
        url = `${BASE_URL}/forecast/locale/${code}/hours/72?token=${encodeURIComponent(FORECAST_TOKEN)}`;
        break;
      case "days15":
        url = `${BASE_URL}/forecast/locale/${code}/days/15?token=${encodeURIComponent(FORECAST_TOKEN)}`;
        break;
      case "history":
        url = `${BASE_URL}/history/locale/${code}?token=${encodeURIComponent(HISTORY_TOKEN)}&from=${safeFromDate}`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid endpoint" }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
    }

    let response: Response;
    try {
      response = await fetch(url);
    } catch (networkError) {
      console.error(`Network error: endpoint=${endpoint}, locationCode=${code}`);
      return new Response(
        JSON.stringify({ error: "SERVICE_UNAVAILABLE", fallback: true }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      console.error(`Climatempo API error: status=${response.status}, endpoint=${endpoint}, locationCode=${code}`);
      const isFallbackable = response.status >= 500;
      return new Response(
        JSON.stringify({
          error: isFallbackable ? "SERVICE_UNAVAILABLE" : "Upstream weather API error",
          fallback: isFallbackable,
          status: response.status,
        }),
        {
          status: isFallbackable ? 200 : response.status,
          headers: { ...headers, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Proxy error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: "SERVICE_FAILED", fallback: true }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
});
