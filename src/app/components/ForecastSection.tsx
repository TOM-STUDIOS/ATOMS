import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Wind, TrendingUp, TrendingDown } from 'lucide-react';
import { WeatherData, WeatherTheme } from '../utils/weatherApi';

interface ForecastSectionProps {
  data: WeatherData;
  theme: WeatherTheme;
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const conditionEmoji = (code: number, isDay = 1): string => {
  if (!isDay) return '🌙';
  if (code === 1000) return '☀️';
  if (code <= 1009) return '⛅';
  if (code <= 1030) return '🌫️';
  if (code <= 1072) return '🌦️';
  if (code <= 1099) return '⛈️';
  if (code <= 1117) return '❄️';
  if (code <= 1147) return '🌨️';
  if (code <= 1201) return '🌧️';
  if (code <= 1237) return '🌨️';
  if (code <= 1264) return '🌧️';
  if (code <= 1282) return '⛈️';
  return '🌤️';
};

export function ForecastSection({ data, theme }: ForecastSectionProps) {
  const [view, setView] = useState<'hourly' | 'weekly'>('hourly');

  const now = new Date();
  const currentHour = now.getHours();
  const todayHours = data.forecast.forecastday[0].hour;
  const sortedHours = [...todayHours.slice(currentHour), ...todayHours.slice(0, currentHour)].slice(0, 24);

  const glassBg = `rgba(255,255,255,0.05)`;
  const glassBorder = `1px solid rgba(255,255,255,0.1)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl p-6"
      style={{ background: glassBg, border: glassBorder, backdropFilter: 'blur(20px)' }}
    >
      {/* Header + toggle */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-white font-bold text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            {view === 'hourly' ? '24-Hour Forecast' : '7-Day Forecast'}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {view === 'hourly' ? 'Temperature throughout the day' : 'Week ahead overview'}
          </p>
        </div>

        <div
          className="flex rounded-xl p-1"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {(['hourly', 'weekly'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                background: view === v ? theme.accentColor : 'transparent',
                color: view === v ? '#080c1a' : 'rgba(255,255,255,0.5)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'hourly' ? (
          <motion.div
            key="hourly"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          >
            {sortedHours.map((hour, idx) => {
              const t = new Date(hour.time);
              const isCurrent = t.getHours() === currentHour && idx === 0;
              const h = t.getHours();
              const label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;

              return (
                <motion.div
                  key={`hour-${idx}`}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl min-w-[90px] shrink-0"
                  style={{
                    background: isCurrent
                      ? `linear-gradient(135deg, ${theme.accentColor}33, ${theme.accentColor}15)`
                      : 'rgba(255,255,255,0.05)',
                    border: isCurrent ? `1px solid ${theme.accentColor}66` : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isCurrent ? `0 0 20px ${theme.accentGlow}` : 'none',
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: isCurrent ? theme.accentColor : 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {isCurrent ? 'Now' : label}
                  </span>
                  <span style={{ fontSize: 28 }}>{conditionEmoji(hour.condition.code)}</span>
                  <span className="font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {Math.round(hour.temp_c)}°
                  </span>
                  <div className="flex items-center gap-1">
                    <Droplets size={10} style={{ color: '#38bdf8' }} />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {hour.chance_of_rain}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-2"
          >
            {data.forecast.forecastday.map((day, idx) => {
              const date = new Date(day.date + 'T12:00:00');
              const isToday = idx === 0;
              const tempRange = day.day.maxtemp_c - day.day.mintemp_c;
              const allMaxes = data.forecast.forecastday.map(d => d.day.maxtemp_c);
              const globalMax = Math.max(...allMaxes);
              const globalMin = Math.min(...data.forecast.forecastday.map(d => d.day.mintemp_c));
              const barStart = ((day.day.mintemp_c - globalMin) / (globalMax - globalMin)) * 100;
              const barWidth = (tempRange / (globalMax - globalMin)) * 100;

              return (
                <motion.div
                  key={`day-${idx}`}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                  style={{
                    background: isToday ? `${theme.accentColor}15` : 'rgba(255,255,255,0.04)',
                    border: isToday ? `1px solid ${theme.accentColor}44` : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {/* Day */}
                  <div className="w-20 shrink-0">
                    <p className="font-semibold text-white text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {isToday ? 'Today' : weekdays[date.getDay()]}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {months[date.getMonth()]} {date.getDate()}
                    </p>
                  </div>

                  {/* Icon + condition */}
                  <div className="flex items-center gap-2 w-36 shrink-0">
                    <span style={{ fontSize: 24 }}>{conditionEmoji(day.day.condition.code)}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                      {day.day.condition.text}
                    </span>
                  </div>

                  {/* Rain chance */}
                  <div className="flex items-center gap-1 w-16 shrink-0">
                    <Droplets size={12} style={{ color: '#38bdf8' }} />
                    <span className="text-xs" style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                      {Math.round(day.day.totalprecip_mm)}mm
                    </span>
                  </div>

                  {/* Temp bar */}
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <span className="text-xs w-8 text-right shrink-0" style={{ color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace' }}>
                      {Math.round(day.day.mintemp_c)}°
                    </span>
                    <div className="flex-1 h-2 rounded-full relative" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="absolute h-full rounded-full"
                        style={{
                          left: `${barStart}%`,
                          width: `${Math.max(barWidth, 10)}%`,
                          background: `linear-gradient(90deg, #60a5fa, ${theme.accentColor})`,
                          boxShadow: `0 0 8px ${theme.accentGlow}`,
                        }}
                      />
                    </div>
                    <span className="text-xs w-8 shrink-0" style={{ color: '#fb923c', fontFamily: 'JetBrains Mono, monospace' }}>
                      {Math.round(day.day.maxtemp_c)}°
                    </span>
                  </div>

                  {/* Wind */}
                  <div className="flex items-center gap-1 w-20 shrink-0 justify-end">
                    <Wind size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {Math.round(day.day.maxwind_kph)} km/h
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
