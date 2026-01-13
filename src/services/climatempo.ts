// Climatempo API Service
const FORECAST_TOKEN = "89bb538e364626514c7c6f4144c3a3cb";
const HISTORY_TOKEN = "730dfea9272da27dc1ce7dab4107467e";

const BASE_URL = "https://apiadvisor.climatempo.com.br/api/v1";

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

// Get current weather for a location
export const getCurrentWeather = async (locationCode: number): Promise<CurrentWeather> => {
  const response = await fetch(
    `${BASE_URL}/weather/locale/${locationCode}/current?token=${FORECAST_TOKEN}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch current weather: ${response.statusText}`);
  }
  
  return response.json();
};

// Get 72-hour forecast
export const get72HourForecast = async (locationCode: number): Promise<HourlyForecast> => {
  const response = await fetch(
    `${BASE_URL}/forecast/locale/${locationCode}/hours/72?token=${FORECAST_TOKEN}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch 72h forecast: ${response.statusText}`);
  }
  
  return response.json();
};

// Get 15-day forecast
export const get15DayForecast = async (locationCode: number): Promise<DailyForecast> => {
  const response = await fetch(
    `${BASE_URL}/forecast/locale/${locationCode}/days/15?token=${FORECAST_TOKEN}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch 15-day forecast: ${response.statusText}`);
  }
  
  return response.json();
};

// Get historical data
export const getHistoricalData = async (
  locationCode: number,
  fromDate: string = "2024-01-01"
): Promise<HistoricalData> => {
  const response = await fetch(
    `${BASE_URL}/history/locale/${locationCode}?token=${HISTORY_TOKEN}&from=${fromDate}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch historical data: ${response.statusText}`);
  }
  
  return response.json();
};

// Weather condition to icon mapping
export const getWeatherIcon = (condition: string): string => {
  const iconMap: Record<string, string> = {
    "1": "☀️", // Clear day
    "1n": "🌙", // Clear night
    "2": "⛅", // Partly cloudy day
    "2n": "☁️", // Partly cloudy night
    "2r": "🌧️", // Rain showers
    "2rn": "🌧️", // Night rain
    "3": "☁️", // Cloudy
    "3n": "☁️", // Cloudy night
    "4": "🌧️", // Rain
    "4n": "🌧️", // Night rain
    "4r": "🌧️", // Heavy rain
    "4t": "⛈️", // Thunderstorm
    "5": "🌧️", // Light rain
    "5n": "🌧️", // Night light rain
    "6": "⛈️", // Storm
    "6n": "⛈️", // Night storm
    "7": "🌧️", // Heavy rain
    "8": "❄️", // Snow
    "9": "🌫️", // Fog
  };
  
  return iconMap[condition] || "🌤️";
};

// Format temperature display
export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`;
};
