// Climatempo API Service — direct HTTP calls

export class ApiConfigError extends Error {
  constructor(msg: string) { super(msg); this.name = "ApiConfigError"; }
}
export class ApiNetworkError extends Error {
  constructor(msg: string) { super(msg); this.name = "ApiNetworkError"; }
}
export class ApiUpstreamError extends Error {
  constructor(msg: string) { super(msg); this.name = "ApiUpstreamError"; }
}

export interface CurrentWeather {
  id: number;
  name: string;
  state: string;
  country: string;
  data: {
    temperature: number;
    wind_direction: string;
    wind_velocity: number;
    humidity: number;
    condition: string;
    pressure: number;
    icon: string;
    sensation: number;
    date: string;
  };
}

export interface HourlyForecast {
  id: number;
  name: string;
  state: string;
  country: string;
  data: {
    date: string;
    date_br: string;
    hour_to_hour: Array<{
      hour: string;
      temp: number;
      humidity: number;
      rain: number;
      wind_direction: string;
      wind_velocity: number;
      condition: string;
      icon: string;
    }>;
  }[];
}

export interface DailyForecast {
  id: number;
  name: string;
  state: string;
  country: string;
  data: Array<{
    date: string;
    date_br: string;
    text_icon: {
      icon: { day: string; night: string };
      text: { pt: string };
    };
    temperature: {
      min: number;
      max: number;
    };
    rain: {
      probability: number;
      precipitation: number;
    };
    wind: {
      velocity_min: number;
      velocity_max: number;
      direction: string;
    };
    humidity: {
      min: number;
      max: number;
    };
    sun: {
      sunrise: string;
      sunset: string;
    };
  }>;
}

export interface HistoricalData {
  id: number;
  name: string;
  state: string;
  country: string;
  data: Array<{
    date: string;
    temperature_min: number;
    temperature_max: number;
    rain: number;
    humidity_min: number;
    humidity_max: number;
  }>;
}

class ClimatempoHttpClient {
  private static BASE_URL = "https://apiadvisor.climatempo.com.br/api/v1";
  private static readonly VALID_ENDPOINTS = new Set(["current", "hours72", "days15", "history"]);

  private static sanitizeToken(value: string | undefined): string | undefined {
    return value?.trim().replace(/^['"]|['"]$/g, "");
  }

  private static getEnvValue(name: string): string | undefined {
    const env = (typeof import.meta !== "undefined" ? (import.meta as any).env : undefined) as Record<string, string> | undefined;
    return env?.[`VITE_${name}`] || globalThis.process?.env?.[name];
  }

  private static getTokens() {
    const forecastToken = this.sanitizeToken(this.getEnvValue("CLIMATEMPO_FORECAST_TOKEN"));
    const historyToken = this.sanitizeToken(this.getEnvValue("CLIMATEMPO_HISTORY_TOKEN"));
    if (!forecastToken || !historyToken) {
      throw new ApiConfigError("Tokens climáticos não configurados. Contate o administrador.");
    }
    return { forecastToken, historyToken };
  }

  private static async makeRequest(
    endpoint: string,
    locationCode: number,
    params?: Record<string, string>
  ): Promise<any> {
    if (!this.VALID_ENDPOINTS.has(endpoint)) {
      throw new ApiConfigError("Invalid endpoint");
    }

    const code = Number(locationCode);
    if (!Number.isInteger(code) || code <= 0 || code > 9_999_999) {
      throw new ApiConfigError("Invalid locationCode");
    }

    const safeFromDate = typeof params?.fromDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.fromDate)
      ? params.fromDate
      : "2024-01-01";

    const { forecastToken, historyToken } = this.getTokens();

    let url: string;
    switch (endpoint) {
      case "current":
        url = `${this.BASE_URL}/weather/locale/${code}/current?token=${encodeURIComponent(forecastToken)}`;
        break;
      case "hours72":
        url = `${this.BASE_URL}/forecast/locale/${code}/hours/72?token=${encodeURIComponent(forecastToken)}`;
        break;
      case "days15":
        url = `${this.BASE_URL}/forecast/locale/${code}/days/15?token=${encodeURIComponent(forecastToken)}`;
        break;
      case "history":
        url = `${this.BASE_URL}/history/locale/${code}?token=${encodeURIComponent(historyToken)}&from=${safeFromDate}`;
        break;
      default:
        throw new ApiConfigError("Invalid endpoint");
    }

    let response: Response;
    try {
      response = await fetch(url);
    } catch (networkError) {
      throw new ApiNetworkError("Serviço temporariamente indisponível");
    }

    if (!response.ok) {
      const isFallback = response.status >= 500;
      if (isFallback) {
        throw new ApiUpstreamError("API Climatempo indisponível");
      }
      throw new ApiUpstreamError("Upstream weather API error");
    }

    return await response.json();
  }

  static async getCurrentWeather(locationCode: number): Promise<CurrentWeather> {
    return this.makeRequest("current", locationCode);
  }

  static async get72HourForecast(locationCode: number): Promise<HourlyForecast> {
    return this.makeRequest("hours72", locationCode);
  }

  static async get15DayForecast(locationCode: number): Promise<DailyForecast> {
    return this.makeRequest("days15", locationCode);
  }

  static async getHistoricalData(locationCode: number, fromDate: string = "2024-01-01"): Promise<HistoricalData> {
    return this.makeRequest("history", locationCode, { fromDate });
  }
}

export const getCurrentWeather = async (locationCode: number): Promise<CurrentWeather> => {
  return ClimatempoHttpClient.getCurrentWeather(locationCode);
};

export const get72HourForecast = async (locationCode: number): Promise<HourlyForecast> => {
  return ClimatempoHttpClient.get72HourForecast(locationCode);
};

export const get15DayForecast = async (locationCode: number): Promise<DailyForecast> => {
  return ClimatempoHttpClient.get15DayForecast(locationCode);
};

export const getHistoricalData = async (
  locationCode: number,
  fromDate: string = "2024-01-01"
): Promise<HistoricalData> => {
  return ClimatempoHttpClient.getHistoricalData(locationCode, fromDate);
};

export const getWeatherIcon = (condition: string): string => {
  const iconMap: Record<string, string> = {
    "1": "☀️",
    "1n": "🌙",
    "2": "⛅",
    "2n": "☁️",
    "2r": "🌧️",
    "2rn": "🌧️",
    "3": "☁️",
    "3n": "☁️",
    "4": "🌧️",
    "4n": "🌧️",
    "4r": "🌧️",
    "4t": "⛈️",
    "5": "🌧️",
    "5n": "🌧️",
    "6": "⛈️",
    "6n": "⛈️",
    "7": "🌧️",
    "8": "❄️",
    "9": "🌫️",
  };

  return iconMap[condition] || "🌤️";
};

export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`;
};