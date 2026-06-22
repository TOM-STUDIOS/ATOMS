export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    humidity: number;
    uv: number;
    pressure_mb: number;
    visibility_km: number;
    is_day: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        totalprecip_mm: number;
        avghumidity: number;
        maxwind_kph: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        wind_kph: number;
        humidity: number;
        chance_of_rain: number;
      }>;
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
        moon_illumination: string;
      };
    }>;
  };
}

export type WeatherThemeKey = 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'stormy' | 'night';

export interface WeatherTheme {
  key: WeatherThemeKey;
  gradient: string;
  cardGlass: string;
  accentColor: string;
  accentGlow: string;
  navBg: string;
  particle: string;
  chartStroke: string;
  chartFill: string;
  badgeBg: string;
  icon: string;
  label: string;
}

export const weatherThemes: Record<WeatherThemeKey, WeatherTheme> = {
  sunny: {
    key: 'sunny',
    gradient: 'linear-gradient(135deg, #0f2027 0%, #1a3a5c 40%, #203a43 70%, #2c5364 100%)',
    cardGlass: 'rgba(255,200,80,0.08)',
    accentColor: '#fbbf24',
    accentGlow: 'rgba(251,191,36,0.3)',
    navBg: 'rgba(15,32,39,0.85)',
    particle: '#fde68a',
    chartStroke: '#fbbf24',
    chartFill: 'rgba(251,191,36,0.15)',
    badgeBg: 'rgba(251,191,36,0.15)',
    icon: '☀️',
    label: 'Clear & Sunny',
  },
  cloudy: {
    key: 'cloudy',
    gradient: 'linear-gradient(135deg, #0f1623 0%, #1e2d45 40%, #2a3f5f 70%, #1a2a42 100%)',
    cardGlass: 'rgba(148,163,184,0.08)',
    accentColor: '#94a3b8',
    accentGlow: 'rgba(148,163,184,0.25)',
    navBg: 'rgba(15,22,35,0.85)',
    particle: '#cbd5e1',
    chartStroke: '#94a3b8',
    chartFill: 'rgba(148,163,184,0.15)',
    badgeBg: 'rgba(148,163,184,0.15)',
    icon: '⛅',
    label: 'Partly Cloudy',
  },
  rainy: {
    key: 'rainy',
    gradient: 'linear-gradient(135deg, #0a0f1a 0%, #0d1f35 40%, #152840 70%, #0a1628 100%)',
    cardGlass: 'rgba(56,189,248,0.07)',
    accentColor: '#38bdf8',
    accentGlow: 'rgba(56,189,248,0.3)',
    navBg: 'rgba(10,15,26,0.9)',
    particle: '#7dd3fc',
    chartStroke: '#38bdf8',
    chartFill: 'rgba(56,189,248,0.15)',
    badgeBg: 'rgba(56,189,248,0.15)',
    icon: '🌧️',
    label: 'Rainy',
  },
  snowy: {
    key: 'snowy',
    gradient: 'linear-gradient(135deg, #0c1527 0%, #142035 40%, #1e3050 70%, #0f1d30 100%)',
    cardGlass: 'rgba(224,242,254,0.08)',
    accentColor: '#e0f2fe',
    accentGlow: 'rgba(224,242,254,0.2)',
    navBg: 'rgba(12,21,39,0.88)',
    particle: '#bae6fd',
    chartStroke: '#bae6fd',
    chartFill: 'rgba(186,230,253,0.15)',
    badgeBg: 'rgba(224,242,254,0.12)',
    icon: '❄️',
    label: 'Snowy',
  },
  stormy: {
    key: 'stormy',
    gradient: 'linear-gradient(135deg, #050810 0%, #0c1020 40%, #12182e 70%, #080c18 100%)',
    cardGlass: 'rgba(139,92,246,0.08)',
    accentColor: '#a78bfa',
    accentGlow: 'rgba(139,92,246,0.35)',
    navBg: 'rgba(5,8,16,0.95)',
    particle: '#c4b5fd',
    chartStroke: '#a78bfa',
    chartFill: 'rgba(167,139,250,0.15)',
    badgeBg: 'rgba(139,92,246,0.15)',
    icon: '⛈️',
    label: 'Stormy',
  },
  night: {
    key: 'night',
    gradient: 'linear-gradient(135deg, #020408 0%, #060d1a 30%, #0a1428 60%, #060e1e 100%)',
    cardGlass: 'rgba(99,102,241,0.07)',
    accentColor: '#818cf8',
    accentGlow: 'rgba(99,102,241,0.3)',
    navBg: 'rgba(2,4,8,0.92)',
    particle: '#c7d2fe',
    chartStroke: '#818cf8',
    chartFill: 'rgba(129,140,248,0.15)',
    badgeBg: 'rgba(99,102,241,0.12)',
    icon: '🌙',
    label: 'Clear Night',
  },
};

export const getWeatherTheme = (conditionCode: number, isDay: number): WeatherThemeKey => {
  if (!isDay) return 'night';

  const themeMap: Record<number, WeatherThemeKey> = {
    1000: 'sunny',
    1003: 'cloudy',
    1006: 'cloudy',
    1009: 'cloudy',
    1063: 'rainy',
    1066: 'snowy',
    1087: 'stormy',
    1180: 'rainy',
    1183: 'rainy',
    1186: 'rainy',
    1189: 'rainy',
    1192: 'rainy',
    1195: 'rainy',
    1210: 'snowy',
    1213: 'snowy',
    1216: 'snowy',
    1219: 'snowy',
    1222: 'snowy',
    1225: 'snowy',
    1273: 'stormy',
    1276: 'stormy',
  };
  return themeMap[conditionCode] || 'sunny';
};

// ─── Real API integration ────────────────────────────────────────────────────
// Sign up free at https://www.weatherapi.com/ and paste your key below.
const WEATHER_API_KEY = '043a21f59c2468b0cae2ac3b54fff786';

async function fetchRealWeatherData(query: string): Promise<WeatherData> {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=no&alerts=no`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WeatherAPI error: ${res.status}`);
  const json = await res.json();

  // Normalize the API response to our WeatherData shape
  return {
    location: {
      name: json.location.name,
      region: json.location.region,
      country: json.location.country,
      lat: json.location.lat,
      lon: json.location.lon,
      localtime: json.location.localtime,
    },
    current: {
      temp_c: json.current.temp_c,
      feelslike_c: json.current.feelslike_c,
      condition: json.current.condition,
      wind_kph: json.current.wind_kph,
      humidity: json.current.humidity,
      uv: json.current.uv,
      pressure_mb: json.current.pressure_mb,
      visibility_km: json.current.vis_km,
      is_day: json.current.is_day,
    },
    forecast: {
      forecastday: json.forecast.forecastday.map((day: any) => ({
        date: day.date,
        day: {
          maxtemp_c: day.day.maxtemp_c,
          mintemp_c: day.day.mintemp_c,
          avgtemp_c: day.day.avgtemp_c,
          totalprecip_mm: day.day.totalprecip_mm,
          avghumidity: day.day.avghumidity,
          maxwind_kph: day.day.maxwind_kph,
          condition: day.day.condition,
        },
        hour: day.hour.map((h: any) => ({
          time: h.time,
          temp_c: h.temp_c,
          condition: h.condition,
          wind_kph: h.wind_kph,
          humidity: h.humidity,
          chance_of_rain: h.chance_of_rain,
        })),
        astro: {
          sunrise: day.astro.sunrise,
          sunset: day.astro.sunset,
          moonrise: day.astro.moonrise,
          moonset: day.astro.moonset,
          moon_phase: day.astro.moon_phase,
          moon_illumination: String(day.astro.moon_illumination),
        },
      })),
    },
  };
}

async function getMockWeatherData(lat: number, lon: number, cityName?: string): Promise<WeatherData> {
  await new Promise(resolve => setTimeout(resolve, 400));
  const now = new Date();

  return {
    location: {
      name: cityName || 'San Francisco',
      region: cityName ? '' : 'California',
      country: cityName ? '' : 'USA',
      lat,
      lon,
      localtime: now.toISOString(),
    },
    current: {
      temp_c: 22,
      feelslike_c: 21,
      condition: { text: 'Partly Cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/116.png', code: 1003 },
      wind_kph: 15,
      humidity: 65,
      uv: 6,
      pressure_mb: 1013,
      visibility_km: 16,
      is_day: now.getHours() >= 6 && now.getHours() < 20 ? 1 : 0,
    },
    forecast: {
      forecastday: Array.from({ length: 7 }, (_, i) => {
        const forecastDate = new Date(now);
        forecastDate.setDate(forecastDate.getDate() + i);
        forecastDate.setHours(0, 0, 0, 0);
        const temps = [22, 19, 25, 17, 23, 26, 20];
        const base = temps[i] ?? 20;

        return {
          date: forecastDate.toISOString().split('T')[0],
          day: {
            maxtemp_c: base + 4 + Math.random() * 2,
            mintemp_c: base - 5 + Math.random() * 2,
            avgtemp_c: base + Math.random() * 2,
            totalprecip_mm: i % 3 === 0 ? Math.random() * 12 : Math.random() * 3,
            avghumidity: 55 + Math.random() * 30,
            maxwind_kph: 10 + Math.random() * 25,
            condition: {
              text: ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Sunny', 'Partly Cloudy', 'Clear'][i],
              icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
              code: [1000, 1003, 1009, 1183, 1000, 1003, 1000][i],
            },
          },
          hour: Array.from({ length: 24 }, (_, h) => {
            const hourTime = new Date(forecastDate);
            hourTime.setHours(h, 0, 0, 0);
            const tempVariation = Math.sin((h - 6) * Math.PI / 12) * 6;
            return {
              time: hourTime.toISOString(),
              temp_c: base + tempVariation + (Math.random() - 0.5) * 2,
              condition: { text: 'Partly Cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/116.png', code: 1003 },
              wind_kph: 8 + Math.random() * 18,
              humidity: 55 + Math.random() * 30,
              chance_of_rain: h > 14 && h < 20 ? Math.round(Math.random() * 40) : Math.round(Math.random() * 15),
            };
          }),
          astro: {
            sunrise: '06:28 AM',
            sunset: '08:02 PM',
            moonrise: i % 2 === 0 ? '07:45 PM' : '08:30 PM',
            moonset: i % 2 === 0 ? '06:15 AM' : '07:20 AM',
            moon_phase: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter'][i],
            moon_illumination: String([0, 25, 50, 75, 100, 75, 50][i]),
          },
        };
      }),
    },
  };
}
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  // Try real API first, fallback to mock data if it fails
  if (WEATHER_API_KEY && WEATHER_API_KEY !== 'YOUR_API_KEY_HERE') {
    try {
      const data = await fetchRealWeatherData(`${lat},${lon}`);
      console.log('✅ Using real WeatherAPI data');
      return data;
    } catch (error) {
      console.warn('⚠️ WeatherAPI failed, using mock data:', error);
      return getMockWeatherData(lat, lon);
    }
  }
  
  console.log('📦 Using mock data (no API key configured)');
  return getMockWeatherData(lat, lon);
}

export async function searchCity(cityName: string): Promise<WeatherData> {
  // Try real API first, fallback to mock data if it fails
  if (WEATHER_API_KEY && WEATHER_API_KEY !== 'YOUR_API_KEY_HERE') {
    try {
      const data = await fetchRealWeatherData(cityName);
      console.log('✅ Using real WeatherAPI data for', cityName);
      return data;
    } catch (error) {
      console.warn('⚠️ WeatherAPI failed, using mock data for', cityName, ':', error);
      return getMockWeatherData(37.7749, -122.4194, cityName);
    }
  }
  
  console.log('📦 Using mock data for', cityName, '(no API key configured)');
  return getMockWeatherData(37.7749, -122.4194, cityName);
}