import { useState, useId } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { WeatherData, WeatherTheme } from '../utils/weatherApi';

interface ChartsSectionProps {
  data: WeatherData;
  theme: WeatherTheme;
}

const CustomTooltip = ({ active, payload, label, accent, formatter }: any) => {
  if (!active || !payload?.length) return null;
  const displayLabel = formatter ? formatter(label) : label;
  return (
    <div
      className="px-4 py-3 rounded-xl"
      style={{ background: 'rgba(8,12,26,0.95)', border: `1px solid ${accent}44`, backdropFilter: 'blur(12px)' }}
    >
      <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>{displayLabel}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-sm text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {entry.name}: <strong>{entry.value}{entry.unit ?? ''}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};

export function ChartsSection({ data, theme }: ChartsSectionProps) {
  const [activeChart, setActiveChart] = useState<'temperature' | 'precipitation' | 'humidity'>('temperature');
  const uniqueId = useId();

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const chartData = data.forecast.forecastday.map((day, i) => {
    const date = new Date(day.date + 'T12:00:00');
    return {
      // Use index as unique key - this is stable across renders
      day: i,
      dateKey: day.date,
      label: i === 0 ? 'Today' : weekdays[date.getDay()],
      max: Math.round(day.day.maxtemp_c),
      min: Math.round(day.day.mintemp_c),
      avg: Math.round(day.day.avgtemp_c),
      rainfall: Math.round(day.day.totalprecip_mm * 10) / 10,
      humidity: Math.round(day.day.avghumidity),
    };
  });

  const tickFormatter = (day: number) => {
    const item = chartData[day];
    return item ? item.label : String(day);
  };

  const tabs = [
    { key: 'temperature', label: 'Temperature', unit: '°C' },
    { key: 'precipitation', label: 'Precipitation', unit: 'mm' },
    { key: 'humidity', label: 'Humidity', unit: '%' },
  ] as const;

  const glassBg = 'rgba(255,255,255,0.05)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-3xl p-6"
      style={{ background: glassBg, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-white font-bold text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            Analytics
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>7-day weather data visualization</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: activeChart === tab.key ? theme.accentColor : 'rgba(255,255,255,0.07)',
                color: activeChart === tab.key ? '#080c1a' : 'rgba(255,255,255,0.5)',
                border: activeChart === tab.key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {activeChart === 'temperature' && (
          <>
            <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Avg High</p>
              <p className="text-xl font-bold" style={{ color: '#fb923c', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.round(chartData.reduce((s, d) => s + d.max, 0) / chartData.length)}°C
              </p>
            </div>
            <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Avg Low</p>
              <p className="text-xl font-bold" style={{ color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.round(chartData.reduce((s, d) => s + d.min, 0) / chartData.length)}°C
              </p>
            </div>
            <div className="p-3 rounded-2xl text-center" style={{ background: `${theme.accentGlow}`, border: `1px solid ${theme.accentColor}33` }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Range</p>
              <p className="text-xl font-bold" style={{ color: theme.accentColor, fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.round(Math.max(...chartData.map(d => d.max)) - Math.min(...chartData.map(d => d.min)))}°C
              </p>
            </div>
          </>
        )}
        {activeChart === 'precipitation' && (
          <>
            <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Total</p>
              <p className="text-xl font-bold" style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                {chartData.reduce((s, d) => s + d.rainfall, 0).toFixed(1)}mm
              </p>
            </div>
            <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Peak Day</p>
              <p className="text-xl font-bold" style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.max(...chartData.map(d => d.rainfall)).toFixed(1)}mm
              </p>
            </div>
            <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Rainy Days</p>
              <p className="text-xl font-bold" style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                {chartData.filter(d => d.rainfall > 0.5).length}
              </p>
            </div>
          </>
        )}
        {activeChart === 'humidity' && (
          <>
            <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Avg</p>
              <p className="text-xl font-bold" style={{ color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.round(chartData.reduce((s, d) => s + d.humidity, 0) / chartData.length)}%
              </p>
            </div>
            <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Max</p>
              <p className="text-xl font-bold" style={{ color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.max(...chartData.map(d => d.humidity))}%
              </p>
            </div>
            <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Min</p>
              <p className="text-xl font-bold" style={{ color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.min(...chartData.map(d => d.humidity))}%
              </p>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'temperature' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`${uniqueId}-grad-temp-max`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`${uniqueId}-grad-temp-min`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tickFormatter={tickFormatter} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}°`} />
                <Tooltip content={<CustomTooltip accent={theme.accentColor} formatter={tickFormatter} />} />
                <Area type="monotone" dataKey="max" stroke="#fb923c" strokeWidth={2} fill={`url(#${uniqueId}-grad-temp-max)`} name="Max" unit="°C" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="min" stroke="#60a5fa" strokeWidth={2} fill={`url(#${uniqueId}-grad-temp-min)`} name="Min" unit="°C" dot={false} isAnimationActive={false} />
              </AreaChart>
            ) : activeChart === 'precipitation' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`${uniqueId}-grad-rain`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tickFormatter={tickFormatter} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}mm`} />
                <Tooltip content={<CustomTooltip accent="#38bdf8" formatter={tickFormatter} />} />
                <Bar dataKey="rainfall" fill={`url(#${uniqueId}-grad-rain)`} name="Rainfall" unit="mm" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`${uniqueId}-grad-humid`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tickFormatter={tickFormatter} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip accent="#34d399" formatter={tickFormatter} />} />
                <ReferenceLine y={60} stroke="rgba(52,211,153,0.3)" strokeDasharray="4 4" label={{ value: 'Optimal', fill: 'rgba(52,211,153,0.5)', fontSize: 10 }} />
                <Area type="monotone" dataKey="humidity" stroke="#34d399" strokeWidth={2} fill={`url(#${uniqueId}-grad-humid)`} name="Humidity" unit="%" dot={false} isAnimationActive={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
      </div>
    </motion.div>
  );
}