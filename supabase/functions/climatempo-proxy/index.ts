const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BASE_URL = "https://apiadvisor.climatempo.com.br/api/v1";
const VALID_ENDPOINTS = new Set(["current", "hours72", "days15", "history"]);
const MAX_UPSTREAM_ATTEMPTS = 2;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const fetchUpstream = async (url: string): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_UPSTREAM_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (response.status < 500 && response.status !== 429) return response;
      if (attempt === MAX_UPSTREAM_ATTEMPTS) return response;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_UPSTREAM_ATTEMPTS) throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
  }

  throw lastError instanceof Error ? lastError : new Error("Falha de conexão com o provedor");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { endpoint, locationCode, fromDate } = await req.json().catch(() => ({}));

    if (!VALID_ENDPOINTS.has(endpoint)) {
      return json({ error: "config", message: "Endpoint inválido" });
    }
    const code = Number(locationCode);
    if (!Number.isInteger(code) || code <= 0 || code > 9_999_999) {
      return json({ error: "config", message: "Código de localidade inválido" });
    }
    const safeFrom =
      typeof fromDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fromDate) ? fromDate : "2024-01-01";

    const forecastToken = Deno.env.get("CLIMATEMPO_FORECAST_TOKEN");
    const historyToken = Deno.env.get("CLIMATEMPO_HISTORY_TOKEN");
    if (!forecastToken || !historyToken) {
      return json({ error: "config", message: "Tokens da API não configurados" });
    }

    let url: string;
    switch (endpoint) {
      case "current":
        url = `${BASE_URL}/weather/locale/${code}/current?token=${encodeURIComponent(forecastToken)}`;
        break;
      case "hours72":
        url = `${BASE_URL}/forecast/locale/${code}/hours/72?token=${encodeURIComponent(forecastToken)}`;
        break;
      case "days15":
        url = `${BASE_URL}/forecast/locale/${code}/days/15?token=${encodeURIComponent(forecastToken)}`;
        break;
      default:
        url = `${BASE_URL}/history/locale/${code}?token=${encodeURIComponent(historyToken)}&from=${safeFrom}`;
    }

    let upstream: Response;
    try {
      upstream = await fetchUpstream(url);
    } catch (_networkError) {
      // Never crash: the client turns this into a retryable, user-friendly error
      return json({ error: "network", message: "Serviço temporariamente indisponível" });
    }

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error(`Climatempo ${endpoint} ${code} -> ${upstream.status}`);
      return json({
        error: "upstream",
        status: upstream.status,
        message: text.slice(0, 200) || upstream.statusText,
      });
    }

    return json(await upstream.json());
  } catch (error) {
    console.error("climatempo-proxy failure", error instanceof Error ? error.message : error);
    return json({ error: "internal", message: "Erro interno no proxy" });
  }
});
