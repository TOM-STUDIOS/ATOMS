import { useState, useEffect, useRef } from 'react';
import { WeatherData, WeatherTheme } from '../utils/weatherApi';

interface WeatherDotProps {
  data: WeatherData;
  theme: WeatherTheme;
}

type TabType = 'nav' | 'weather' | 'quick' | 'customize';

const NAV_SECTIONS = [
  { id: 'hero', label: 'Overview', icon: '🌤️' },
  { id: 'current', label: 'Current', icon: '🌡️' },
  { id: 'forecast', label: 'Forecast', icon: '📅' },
  { id: 'charts', label: 'Analytics', icon: '📊' },
  { id: 'sunmoon', label: 'Sun & Moon', icon: '🌙' },
  { id: 'contact', label: 'Contact', icon: '✉️' },
];

export function WeatherDot({ data, theme }: WeatherDotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('nav');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [dotSize, setDotSize] = useState(18);
  const [dotColor, setDotColor] = useState(theme.accentColor);
  const [showPulse, setShowPulse] = useState(true);
  const [showRing, setShowRing] = useState(true);
  const [didDrag, setDidDrag] = useState(false);
  const [navMode, setNavMode] = useState<'dot' | 'navbar'>(() => {
    // Load from localStorage or default to 'dot'
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('atomsNavMode') as 'dot' | 'navbar') || 'dot';
    }
    return 'dot';
  });
  const [adaptiveColor, setAdaptiveColor] = useState(true);
  
  const wrapRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Update navbar visibility based on mode
  useEffect(() => {
    if (navMode === 'dot') {
      document.body.classList.add('hide-navbar');
      document.body.classList.remove('show-navbar');
    } else {
      document.body.classList.add('show-navbar');
      document.body.classList.remove('hide-navbar');
    }
    // Save preference
    localStorage.setItem('atomsNavMode', navMode);
  }, [navMode]);

  // Adapt dot color to theme if enabled
  useEffect(() => {
    if (adaptiveColor) {
      setDotColor(theme.accentColor);
    }
  }, [theme.accentColor, adaptiveColor]);

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(Math.min(scrolled, 100));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle keyboard shortcut (.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '.' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Handle drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      setDragPos({ x: e.clientX, y: e.clientY });
      setDidDrag(true);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setTimeout(() => setDidDrag(false), 100);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDotClick = () => {
    if (!didDrag) {
      setIsOpen(prev => !prev);
    }
  };

  const handleDotMouseDown = () => {
    isDraggingRef.current = true;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const getPositionStyles = () => {
    const offset = 28;
    if (dragPos.x !== 0 || dragPos.y !== 0) {
      return { left: `${dragPos.x}px`, top: `${dragPos.y}px`, transform: 'translate(-50%, -50%)' };
    }

    switch (position) {
      case 'top-left':
        return { top: `${offset}px`, left: `${offset}px` };
      case 'top-right':
        return { top: `${offset}px`, right: `${offset}px` };
      case 'bottom-left':
        return { bottom: `${offset}px`, left: `${offset}px` };
      case 'bottom-right':
      default:
        return { bottom: `${offset}px`, right: `${offset}px` };
    }
  };

  const circumference = 2 * Math.PI * 12;
  const strokeOffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed',
        zIndex: 9999,
        userSelect: 'none',
        ...getPositionStyles(),
      }}
    >
      {/* Progress Ring */}
      {showRing && (
        <svg
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: dotSize + 13,
            height: dotSize + 13,
            pointerEvents: 'none',
          }}
          viewBox="0 0 30 30"
        >
          <circle
            cx="15"
            cy="15"
            r="12"
            fill="none"
            stroke={dotColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 0.2s ease, stroke 0.45s ease',
              opacity: 0.55,
            }}
          />
        </svg>
      )}

      {/* Dot Core */}
      <div
        onMouseDown={handleDotMouseDown}
        onClick={handleDotClick}
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: dotColor,
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
          position: 'relative',
          zIndex: 2,
          transition: 'background 0.45s ease, box-shadow 0.3s ease',
          boxShadow: isOpen ? `0 0 0 8px ${dotColor}35` : 'none',
        }}
      >
        {/* Pulse Animation */}
        {showPulse && !isOpen && (
          <div
            style={{
              position: 'absolute',
              inset: -5,
              borderRadius: '50%',
              border: `1.5px solid ${dotColor}`,
              animation: 'dotPulse 3s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Hint */}
      {!isOpen && (
        <div
          style={{
            position: 'absolute',
            right: dotSize + 12,
            bottom: '50%',
            transform: 'translateY(50%)',
            background: 'rgba(22,22,44,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 7,
            padding: '4px 9px',
            fontSize: '0.69rem',
            color: 'rgba(255,255,255,0.6)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
          className="dot-hint"
        >
          Drag • Click • Press <strong>.</strong>
        </div>
      )}

      {/* Panel */}
      <div
        style={{
          position: 'absolute',
          bottom: position.includes('bottom') ? dotSize + 10 : 'auto',
          top: position.includes('top') ? dotSize + 10 : 'auto',
          right: position.includes('right') ? 0 : 'auto',
          left: position.includes('left') ? 0 : 'auto',
          width: 340,
          maxHeight: '520px',
          background: 'rgba(15,15,30,0.97)',
          backdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 22,
          overflow: 'hidden',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.72) translateY(12px)',
          transformOrigin: position.includes('bottom') ? 'bottom' : 'top' + ' ' + (position.includes('right') ? 'right' : 'left'),
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease, transform 0.42s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '13px 15px 11px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <div
            style={{
              width: 29,
              height: 29,
              borderRadius: 9,
              background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.accentColor}99)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            ⚛
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            ATOMS
          </span>
          <span style={{ fontSize: '0.67rem', fontWeight: 500, color: theme.accentColor, fontFamily: 'Inter, sans-serif' }}>
            Weather
          </span>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              marginLeft: 'auto',
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(136,136,170,1)',
              fontSize: '0.82rem',
              fontFamily: 'inherit',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
              e.currentTarget.style.color = '#e4e4f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = 'rgba(136,136,170,1)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '7px 11px 0',
            gap: 3,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'nav' as TabType, label: 'Navigate' },
            { id: 'weather' as TabType, label: 'Weather' },
            { id: 'quick' as TabType, label: 'Quick' },
            { id: 'customize' as TabType, label: '⚙ Dot' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                padding: '5px 10px',
                border: 'none',
                background: 'transparent',
                color: activeTab === tab.id ? theme.accentColor : 'rgba(136,136,170,1)',
                fontSize: '0.71rem',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                borderRadius: '7px 7px 0 0',
                transition: 'color 0.18s',
                borderBottom: activeTab === tab.id ? `2px solid ${theme.accentColor}` : '2px solid transparent',
                marginBottom: -1,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {/* Navigate Tab */}
          {activeTab === 'nav' && (
            <div style={{ padding: '7px 9px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV_SECTIONS.map((section) => (
                <div
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 10,
                    color: 'rgba(136,136,170,1)',
                    fontSize: '0.83rem',
                    fontWeight: 500,
                    transition: 'background 0.14s, color 0.14s',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#e4e4f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(136,136,170,1)';
                  }}
                >
                  <div
                    style={{
                      width: 29,
                      height: 29,
                      borderRadius: 7,
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.88rem',
                      flexShrink: 0,
                    }}
                  >
                    {section.icon}
                  </div>
                  {section.label}
                </div>
              ))}
            </div>
          )}

          {/* Weather Tab */}
          {activeTab === 'weather' && (
            <div style={{ padding: '11px 12px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.65rem',
                  color: theme.accentColor,
                  background: `${theme.accentColor}20`,
                  padding: '3px 8px',
                  borderRadius: 100,
                  border: `1px solid ${theme.accentColor}40`,
                  fontWeight: 600,
                  marginBottom: 8,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                ⚡ Live Weather
              </div>
              <div
                style={{
                  background: `${theme.accentColor}08`,
                  border: `1px solid ${theme.accentColor}20`,
                  borderRadius: 11,
                  padding: 11,
                  fontSize: '0.78rem',
                  lineHeight: 1.65,
                  color: '#e4e4f2',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: '#fff' }}>{data.location.name}</strong>
                  {data.location.region && `, ${data.location.region}`}
                </div>
                <div style={{ marginBottom: 6 }}>
                  🌡️ <strong>{Math.round(data.current.temp_c)}°C</strong> • Feels like {Math.round(data.current.feelslike_c)}°C
                </div>
                <div style={{ marginBottom: 6 }}>
                  {data.current.condition.text}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
                  💨 {Math.round(data.current.wind_kph)} km/h • 💧 {data.current.humidity}% • ☀️ UV {data.current.uv}
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>High</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fb923c', fontFamily: 'JetBrains Mono, monospace' }}>
                    {Math.round(data.forecast.forecastday[0].day.maxtemp_c)}°
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>Low</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace' }}>
                    {Math.round(data.forecast.forecastday[0].day.mintemp_c)}°
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Tab */}
          {activeTab === 'quick' && (
            <div style={{ padding: '11px 12px' }}>
              <div style={{ fontSize: '0.63rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(82,82,110,1)', fontWeight: 600, marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
                QUICK ACTIONS
              </div>
              {[
                { icon: '🌤️', label: 'Refresh Weather', action: () => window.location.reload() },
                { icon: '📍', label: 'Update Location', action: () => scrollToSection('hero') },
                { icon: '📊', label: 'View Analytics', action: () => scrollToSection('charts') },
                { icon: '🌙', label: 'Sun & Moon Times', action: () => scrollToSection('sunmoon') },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={item.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 10px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'background 0.14s',
                    marginBottom: 3,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
                  <div style={{ fontSize: '0.8rem', color: '#e4e4f2', fontFamily: 'Inter, sans-serif' }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Customize Tab */}
          {activeTab === 'customize' && (
            <div style={{ padding: '8px 12px 12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(82,82,110,1)', fontWeight: 600, padding: '8px 2px 4px', fontFamily: 'Inter, sans-serif' }}>
                NAVIGATION MODE
              </div>
              
              {/* Mode Switcher */}
              <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 3, margin: '2px 0 6px' }}>
                <button
                  onClick={() => setNavMode('dot')}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    border: 'none',
                    background: navMode === 'dot' ? `rgba(${dotColor === '#ffffff' ? '124,109,250' : dotColor.replace('#', '')},0.22)` : 'transparent',
                    color: navMode === 'dot' ? (dotColor === '#ffffff' ? '#a89ffe' : dotColor) : 'rgba(136,136,170,1)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    borderRadius: 9,
                    transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    boxShadow: navMode === 'dot' ? `0 2px 10px ${dotColor}33` : 'none',
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>⬤</span> Dot
                </button>
                <button
                  onClick={() => setNavMode('navbar')}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    border: 'none',
                    background: navMode === 'navbar' ? `rgba(${dotColor === '#ffffff' ? '124,109,250' : dotColor.replace('#', '')},0.22)` : 'transparent',
                    color: navMode === 'navbar' ? (dotColor === '#ffffff' ? '#a89ffe' : dotColor) : 'rgba(136,136,170,1)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    borderRadius: 9,
                    transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    boxShadow: navMode === 'navbar' ? `0 2px 10px ${dotColor}33` : 'none',
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>☰</span> Navbar
                </button>
              </div>

              <div style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(82,82,110,1)', fontWeight: 600, padding: '8px 2px 4px', fontFamily: 'Inter, sans-serif' }}>
                DOT APPEARANCE
              </div>

              {/* Adaptive Color Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 10, gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
                    🎨
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#e4e4f2', fontFamily: 'Inter, sans-serif' }}>Adaptive Color</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(136,136,170,1)', fontFamily: 'Inter, sans-serif' }}>Match theme colors</div>
                  </div>
                </div>
                <label style={{ position: 'relative', width: 34, height: 19, flexShrink: 0, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={adaptiveColor}
                    onChange={(e) => setAdaptiveColor(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: adaptiveColor ? dotColor : 'rgba(255,255,255,0.1)',
                      borderRadius: 100,
                      transition: 'background 0.2s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        width: 13,
                        height: 13,
                        borderRadius: '50%',
                        background: '#fff',
                        top: 3,
                        left: 3,
                        transform: adaptiveColor ? 'translateX(15px)' : 'translateX(0)',
                        transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* Pulse Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 10, gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
                    💫
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#e4e4f2', fontFamily: 'Inter, sans-serif' }}>Pulse Animation</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(136,136,170,1)', fontFamily: 'Inter, sans-serif' }}>Idle glow ring</div>
                  </div>
                </div>
                <label style={{ position: 'relative', width: 34, height: 19, flexShrink: 0, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showPulse}
                    onChange={(e) => setShowPulse(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: showPulse ? dotColor : 'rgba(255,255,255,0.1)',
                      borderRadius: 100,
                      transition: 'background 0.2s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        width: 13,
                        height: 13,
                        borderRadius: '50%',
                        background: '#fff',
                        top: 3,
                        left: 3,
                        transform: showPulse ? 'translateX(15px)' : 'translateX(0)',
                        transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* Ring Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 10, gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
                    ⭕
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#e4e4f2', fontFamily: 'Inter, sans-serif' }}>Progress Ring</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(136,136,170,1)', fontFamily: 'Inter, sans-serif' }}>Scroll indicator</div>
                  </div>
                </div>
                <label style={{ position: 'relative', width: 34, height: 19, flexShrink: 0, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showRing}
                    onChange={(e) => setShowRing(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: showRing ? dotColor : 'rgba(255,255,255,0.1)',
                      borderRadius: 100,
                      transition: 'background 0.2s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        width: 13,
                        height: 13,
                        borderRadius: '50%',
                        background: '#fff',
                        top: 3,
                        left: 3,
                        transform: showRing ? 'translateX(15px)' : 'translateX(0)',
                        transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(82,82,110,1)', fontWeight: 600, padding: '8px 2px 4px', fontFamily: 'Inter, sans-serif' }}>
                DOT COLOR
              </div>
              <div style={{ display: 'flex', gap: 7, padding: '6px 10px 4px', flexWrap: 'wrap' }}>
                {[
                  theme.accentColor,
                  '#00d4aa',
                  '#fd79a8',
                  '#fdcb6e',
                  '#e17055',
                  '#74b9ff',
                  '#ffffff',
                  '#a89ffe',
                ].map((color) => (
                  <div
                    key={color}
                    onClick={() => setDotColor(color)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: dotColor === color ? '2px solid #fff' : '2px solid transparent',
                      background: color,
                      transition: 'transform 0.15s, border-color 0.15s',
                      transform: dotColor === color ? 'scale(1.15)' : 'scale(1)',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (dotColor !== color) e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (dotColor !== color) e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                ))}
              </div>

              <div style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(82,82,110,1)', fontWeight: 600, padding: '8px 2px 4px', fontFamily: 'Inter, sans-serif' }}>
                DOT SIZE
              </div>
              <div style={{ padding: '3px 10px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(136,136,170,1)', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Small</span>
                <input
                  type="range"
                  min="12"
                  max="28"
                  value={dotSize}
                  onChange={(e) => setDotSize(Number(e.target.value))}
                  style={{
                    flex: 1,
                    height: 3,
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: 'rgba(136,136,170,1)', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Large</span>
              </div>

              <div style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(82,82,110,1)', fontWeight: 600, padding: '8px 2px 4px', fontFamily: 'Inter, sans-serif' }}>
                SNAP POSITION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: '4px 10px 10px' }}>
                {[
                  { id: 'top-left' as const, label: '↖ Top left' },
                  { id: 'top-right' as const, label: '↗ Top right' },
                  { id: 'bottom-left' as const, label: '↙ Bottom left' },
                  { id: 'bottom-right' as const, label: '↘ Bottom right' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => {
                      setPosition(pos.id);
                      setDragPos({ x: 0, y: 0 });
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: position === pos.id ? `1px solid ${dotColor}50` : '1px solid rgba(255,255,255,0.12)',
                      background: position === pos.id ? `${dotColor}20` : 'transparent',
                      color: position === pos.id ? dotColor : 'rgba(136,136,170,1)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      transition: 'all 0.14s',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pulse Keyframe Animation */}
      <style>{`
        @keyframes dotPulse {
          0% { transform: scale(1); opacity: 0.7; }
          65% { transform: scale(2.7); opacity: 0; }
          100% { transform: scale(2.7); opacity: 0; }
        }
        
        div[style*="fixed"]:hover .dot-hint {
          opacity: 1 !important;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${dotColor};
          cursor: pointer;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${dotColor};
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}