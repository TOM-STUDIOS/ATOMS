import { motion } from 'motion/react';
import { Wind, Droplets, Eye, Gauge, Thermometer, Sun } from 'lucide-react';
import { WeatherData, WeatherTheme } from '../utils/weatherApi';

interface HeroSectionProps {
  data: WeatherData;
  theme: WeatherTheme;
}

const WeatherIcon = ({ code, isDay, size = 96 }: { code: number; isDay: number; size?: number }) => {
  const icons: Record<string, string> = {
    sunny: '☀️',
    cloudy: '⛅',
    overcast: '☁️',
    rainy: '🌧️',
    heavyRain: '⛈️',
    snowy: '❄️',
    stormy: '⛈️',
    night: '🌙',
    nightCloud: '🌛',
  };

  let icon = isDay ? icons.sunny : icons.night;
  if (code >= 1003 && code <= 1009) icon = isDay ? icons.cloudy : icons.nightCloud;
  if (code >= 1063 && code <= 1072) icon = icons.rainy;
  if (code >= 1087 && code <= 1099) icon = icons.stormy;
  if (code >= 1180 && code <= 1201) icon = icons.rainy;
  if (code >= 1210 && code <= 1282) icon = icons.snowy;
  if (code >= 1273) icon = icons.stormy;

  return (
    <span style={{ fontSize: size, lineHeight: 1, display: 'block', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
      {icon}
    </span>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  accent: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.04, y: -2 }}
    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
  >
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}22` }}>
      <Icon size={18} style={{ color: accent }} />
    </div>
    <div>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>{label}</p>
      <p className="font-semibold text-sm text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{value}</p>
    </div>
  </motion.div>
);

export function HeroSection({ data, theme }: HeroSectionProps) {
  const { current, location } = data;

  const localTime = new Date(location.localtime);
  const timeStr = localTime.toLocaleString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const uvLabel = current.uv <= 2 ? 'Low' : current.uv <= 5 ? 'Moderate' : current.uv <= 7 ? 'High' : 'Very High';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl p-8"
      style={{
        background: `linear-gradient(135deg, ${theme.cardGlass.replace('0.08', '0.12')} 0%, rgba(255,255,255,0.04) 100%)`,
        border: `1px solid rgba(255,255,255,0.12)`,
        backdropFilter: 'blur(24px)',
        boxShadow: `0 0 60px ${theme.accentGlow}, 0 24px 48px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Location & time */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{ background: theme.badgeBg, color: theme.accentColor, border: `1px solid ${theme.accentColor}33` }}
              >
                {theme.label}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {current.is_day ? '☀ Day' : '🌙 Night'}
              </span>
            </div>
            <h1
              className="text-5xl lg:text-6xl font-bold text-white tracking-tight mb-1"
              style={{ fontFamily: 'Inter, sans-serif', textShadow: `0 0 30px ${theme.accentGlow}` }}
            >
              {location.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }} className="text-sm mb-3">
              {[location.region, location.country].filter(Boolean).join(', ')}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }} className="text-xs">
              {timeStr}
            </p>
          </div>

          {/* Weather icon + temp */}
          <div className="flex items-center gap-4 sm:gap-8">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="shrink-0"
            >
              <WeatherIcon code={current.condition.code} isDay={current.is_day} size={72} />
            </motion.div>

            <div className="text-left sm:text-right min-w-0">
              <div
                className="font-black text-white"
                style={{ fontSize: 'clamp(48px, 12vw, 88px)', lineHeight: 1, fontFamily: 'Inter, sans-serif', textShadow: `0 0 40px ${theme.accentGlow}` }}
              >
                {Math.round(current.temp_c)}°
              </div>
              <p className="text-sm sm:text-base text-white/60 truncate">{current.condition.text}</p>
              <p className="text-xs sm:text-sm mt-1 truncate" style={{ color: theme.accentColor }}>
                Feels like {Math.round(current.feelslike_c)}°C
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
          <StatCard icon={Wind} label="Wind" value={`${current.wind_kph} km/h`} accent={theme.accentColor} />
          <StatCard icon={Droplets} label="Humidity" value={`${current.humidity}%`} accent={theme.accentColor} />
          <StatCard icon={Eye} label="Visibility" value={`${current.visibility_km} km`} accent={theme.accentColor} />
          <StatCard icon={Gauge} label="Pressure" value={`${current.pressure_mb} mb`} accent={theme.accentColor} />
          <StatCard icon={Sun} label="UV Index" value={`${current.uv} · ${uvLabel}`} accent={theme.accentColor} />
          <StatCard icon={Thermometer} label="Feels Like" value={`${Math.round(current.feelslike_c)}°C`} accent={theme.accentColor} />
        </div>
      </div>
    </motion.div>
  );
}