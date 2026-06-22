import { motion } from 'motion/react';
import { WeatherData, WeatherTheme } from '../utils/weatherApi';

interface SunMoonSectionProps {
  data: WeatherData;
  theme: WeatherTheme;
}

const parseTime = (timeStr: string | undefined): { h: number; m: number } => {
  if (!timeStr) return { h: 0, m: 0 };
  const [timePart, period] = timeStr.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return { h, m };
};

const moonPhaseIcon = (phase: string): string => {
  const map: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  };
  return map[phase] ?? '🌙';
};

export function SunMoonSection({ data, theme }: SunMoonSectionProps) {
  const astro = data.forecast.forecastday[0].astro;
  const now = new Date(data.location.localtime);

  const sunrise = parseTime(astro.sunrise);
  const sunset = parseTime(astro.sunset);
  const moonrise = parseTime(astro.moonrise);
  const moonset = parseTime(astro.moonset);
  
  const sunriseMinutes = sunrise.h * 60 + sunrise.m;
  const sunsetMinutes = sunset.h * 60 + sunset.m;
  const moonriseMinutes = moonrise.h * 60 + moonrise.m;
  const moonsetMinutes = moonset.h * 60 + moonset.m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Determine if it's nighttime (after sunset or before sunrise)
  const isNighttime = nowMinutes >= sunsetMinutes || nowMinutes < sunriseMinutes;

  // Calculate progress for sun or moon
  let progress = 0;
  let startMinutes = 0;
  let endMinutes = 0;
  
  if (isNighttime) {
    // Moon tracker
    startMinutes = moonriseMinutes;
    endMinutes = moonsetMinutes;
    
    // Moon typically rises in evening and sets in early morning (crosses midnight)
    if (endMinutes < startMinutes) {
      // Moonset is next day (e.g., moonrise 7:45 PM, moonset 6:15 AM)
      if (nowMinutes >= startMinutes) {
        // Currently between moonrise and midnight
        progress = (nowMinutes - startMinutes) / ((1440 - startMinutes) + endMinutes);
      } else {
        // Currently between midnight and moonset
        progress = ((1440 - startMinutes) + nowMinutes) / ((1440 - startMinutes) + endMinutes);
      }
    } else {
      // Moonset is same day
      progress = (nowMinutes - startMinutes) / (endMinutes - startMinutes);
    }
  } else {
    // Sun tracker
    startMinutes = sunriseMinutes;
    endMinutes = sunsetMinutes;
    progress = (nowMinutes - startMinutes) / (endMinutes - startMinutes);
  }
  
  progress = Math.min(Math.max(progress, 0), 1);

  // Arc path for the sun
  const arcWidth = 400;
  const arcHeight = 160;
  const cx = arcWidth / 2;
  const cy = arcHeight + 20;
  const r = arcHeight + 20;

  const angle = Math.PI - progress * Math.PI;
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy + r * Math.sin(angle);

  const moonIllum = parseInt(astro.moon_illumination) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {/* Sun/Moon Arc Card */}
      <div
        className="rounded-3xl p-6"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-bold text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
              {isNighttime ? 'Moon Tracker' : 'Sun Tracker'}
            </h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {isNighttime ? 'Lunar arc for tonight' : 'Solar arc for today'}
            </p>
          </div>
          <span style={{ fontSize: 28 }}>{isNighttime ? '🌙' : '☀️'}</span>
        </div>

        {/* SVG Arc */}
        <div className="relative w-full overflow-hidden" style={{ height: 160 }}>
          <svg
            viewBox={`0 0 ${arcWidth} ${arcHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full"
            style={{ height: 160 }}
          >
            {/* Horizon line */}
            <line x1="0" y1={arcHeight - 10} x2={arcWidth} y2={arcHeight - 10} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {/* Arc track */}
            <path
              d={`M 20 ${arcHeight - 10} A ${r - cx + arcWidth / 2 - 20} ${arcHeight - 10} 0 0 1 ${arcWidth - 20} ${arcHeight - 10}`}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Progress arc */}
            {progress > 0 && (
              <path
                d={`M 20 ${arcHeight - 10} A ${r - cx + arcWidth / 2 - 20} ${arcHeight - 10} 0 0 1 ${20 + (arcWidth - 40) * progress} ${
                  arcHeight - 10 - Math.sin(progress * Math.PI) * (arcHeight - 20)
                }`}
                fill="none"
                stroke={theme.accentColor}
                strokeWidth="2"
                opacity="0.6"
              />
            )}

            {/* Glow behind sun/moon */}
            <circle
              cx={20 + (arcWidth - 40) * progress}
              cy={arcHeight - 10 - Math.sin(progress * Math.PI) * (arcHeight - 20)}
              r="18"
              fill={theme.accentColor}
              opacity="0.15"
            />

            {/* Animated sun/moon dot */}
            <motion.circle
              cx={20 + (arcWidth - 40) * progress}
              cy={arcHeight - 10 - Math.sin(progress * Math.PI) * (arcHeight - 20)}
              r="10"
              fill={theme.accentColor}
              style={{ filter: `drop-shadow(0 0 8px ${theme.accentColor})` }}
              animate={{ r: [8, 11, 8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Start/End labels */}
            <text x="20" y={arcHeight + 2} fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="JetBrains Mono">
              {isNighttime ? astro.moonrise : astro.sunrise}
            </text>
            <text x={arcWidth - 20} y={arcHeight + 2} fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="end">
              {isNighttime ? astro.moonset : astro.sunset}
            </text>
          </svg>
        </div>

        {/* Time details */}
        <div className="flex justify-between items-center mt-2 px-1 gap-3">
          {isNighttime ? (
            <>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <span style={{ fontSize: 16 }}>🌔</span>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Moonrise</p>
                  <p className="font-semibold text-white text-sm whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{astro.moonrise}</p>
                </div>
              </div>

              <div className="text-center flex-shrink-0 px-2">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Moonlight</p>
                <p className="font-semibold text-sm whitespace-nowrap" style={{ color: theme.accentColor, fontFamily: 'JetBrains Mono, monospace' }}>
                  {(() => {
                    // Calculate moonlight duration (moonset is typically next day)
                    let durationMinutes;
                    if (moonsetMinutes < moonriseMinutes) {
                      // Moonset is next day - typical scenario
                      durationMinutes = (1440 - moonriseMinutes) + moonsetMinutes;
                    } else {
                      // Moonset is same day
                      durationMinutes = moonsetMinutes - moonriseMinutes;
                    }
                    const hours = Math.floor(durationMinutes / 60);
                    const minutes = durationMinutes % 60;
                    return `${hours}h ${minutes}m`;
                  })()}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <span style={{ fontSize: 16 }}>🌘</span>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Moonset</p>
                  <p className="font-semibold text-white text-sm whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{astro.moonset}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.15)' }}>
                  <span style={{ fontSize: 16 }}>🌅</span>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Sunrise</p>
                  <p className="font-semibold text-white text-sm whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{astro.sunrise}</p>
                </div>
              </div>

              <div className="text-center flex-shrink-0 px-2">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Daylight</p>
                <p className="font-semibold text-sm whitespace-nowrap" style={{ color: theme.accentColor, fontFamily: 'JetBrains Mono, monospace' }}>
                  {Math.floor((sunsetMinutes - sunriseMinutes) / 60)}h {(sunsetMinutes - sunriseMinutes) % 60}m
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <span style={{ fontSize: 16 }}>🌇</span>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Sunset</p>
                  <p className="font-semibold text-white text-sm whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{astro.sunset}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Moon Card */}
      <div
        className="rounded-3xl p-6"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>Moon Phase</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Tonight's lunar data</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Moon visual */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative shrink-0"
            style={{ width: 100, height: 100 }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.05), rgba(99,102,241,0.1))', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontSize: 72, filter: 'drop-shadow(0 0 16px rgba(129,140,248,0.5))' }}>
                {moonPhaseIcon(astro.moon_phase)}
              </span>
            </div>
          </motion.div>

          <div className="flex-1">
            <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {astro.moon_phase}
            </p>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {moonIllum === 0 ? 'No visible surface' : moonIllum === 1 ? 'Fully illuminated' : `${Math.round(moonIllum * 100)}% illuminated`}
            </p>

            {/* Illumination bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Illumination</span>
                <span className="text-xs font-semibold" style={{ color: '#818cf8', fontFamily: 'JetBrains Mono, monospace' }}>
                  {astro.moon_illumination}%
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${astro.moon_illumination}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #4f46e5, #818cf8)', boxShadow: '0 0 8px rgba(129,140,248,0.5)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7-day moon phases */}
        <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Week Ahead</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {data.forecast.forecastday.map((day, i) => {
              const date = new Date(day.date + 'T12:00:00');
              const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return (
                <div key={`moon-${i}`} className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {i === 0 ? 'Now' : weekdays[date.getDay()]}
                  </span>
                  <span style={{ fontSize: 22 }}>{moonPhaseIcon(day.astro.moon_phase)}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {day.astro.moon_illumination}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}