/* MARKER-MAKE-KIT-INVOKED */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Loader2, CloudSun, BarChart3, Sun, Mail, Wind, Menu, X } from 'lucide-react';
import { LoadingScreen } from './components/LoadingScreen';
import { HeroSection } from './components/HeroSection';
import { ForecastSection } from './components/ForecastSection';
import { ChartsSection } from './components/ChartsSection';
import { SunMoonSection } from './components/SunMoonSection';
import { ContactSection } from './components/ContactSection';
import { WeatherDot } from './components/WeatherDot';
import {
  fetchWeatherData,
  searchCity,
  getWeatherTheme,
  weatherThemes,
  type WeatherData,
} from './utils/weatherApi';

const NAV_ITEMS = [
  { id: 'current', label: 'Current', icon: CloudSun },
  { id: 'forecast', label: 'Forecast', icon: Wind },
  { id: 'charts', label: 'Analytics', icon: BarChart3 },
  { id: 'sunmoon', label: 'Sun & Moon', icon: Sun },
  { id: 'contact', label: 'Contact', icon: Mail },
];

function Particles({ color }: { color: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            background: color,
            opacity: Math.random() * 0.4 + 0.1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -(Math.random() * 120 + 60)],
            opacity: [0, 0.4, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [activeSection, setActiveSection] = useState('current');
  const [searchError, setSearchError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const themeKey = weatherData
    ? getWeatherTheme(weatherData.current.condition.code, weatherData.current.is_day)
    : 'sunny';
  const theme = weatherThemes[themeKey];

  useEffect(() => {
    loadDefaultWeather();
  }, []);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [weatherData]);

  const loadDefaultWeather = async () => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const data = await fetchWeatherData(37.7749, -122.4194);
      setWeatherData(data);
    } catch (error) {
      console.error('Error loading weather data:', error);
      // Always ensure we have data even if API fails - this shouldn't happen with USE_MOCK
      // But as a safeguard, we'll set loading to false
    } finally {
      // Ensure minimum 5 second loading time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 5000 - elapsedTime);
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    }
  };

  const handleSearch = async () => {
    if (!cityInput.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    try {
      const data = await searchCity(cityInput);
      setWeatherData(data);
      setCityInput('');
    } catch {
      setSearchError('City not found. Try another name.');
    } finally {
      setSearchLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Close mobile menu first
      setMenuOpen(false);
      
      // Small delay to allow menu to close before scrolling
      setTimeout(() => {
        const navHeight = 60; // Navbar height
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update active section
        setActiveSection(id);
      }, 100);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!weatherData) {
    // Show error state instead of returning null
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.gradient }}
      >
        <div className="text-center p-8">
          <p className="text-white text-xl mb-4">Failed to load weather data</p>
          <button
            onClick={loadDefaultWeather}
            className="px-6 py-3 rounded-xl font-semibold"
            style={{ background: theme.accentColor, color: '#080c1a' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={themeKey}
      className="min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ background: theme.gradient, fontFamily: 'Inter, sans-serif' }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] pointer-events-none z-0"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.accentGlow} 0%, transparent 70%)`, filter: 'blur(60px)' }}
      />

      <Particles color={theme.particle} />

      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 w-full"
        style={{ background: theme.navBg, borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* Logo */}
          <span className="font-bold text-white text-sm" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
            ATOMS
          </span>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: activeSection === id ? `${theme.accentColor}22` : 'transparent',
                  color: activeSection === id ? theme.accentColor : 'rgba(255,255,255,0.45)',
                  border: activeSection === id ? `1px solid ${theme.accentColor}44` : '1px solid transparent',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {/* Location */}
          <div className="hidden md:flex items-center gap-1">
            <MapPin size={12} style={{ color: theme.accentColor }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'JetBrains Mono, monospace' }}>
              {weatherData.location.name}
            </span>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5 rounded-lg transition-all"
            style={{
              background: menuOpen ? `${theme.accentColor}22` : 'transparent',
              border: `1px solid ${menuOpen ? theme.accentColor + '44' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            {menuOpen ? (
              <X size={18} style={{ color: theme.accentColor }} />
            ) : (
              <Menu size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: activeSection === id ? `${theme.accentColor}22` : 'transparent',
                      color: activeSection === id ? theme.accentColor : 'rgba(255,255,255,0.45)',
                      border: activeSection === id ? `1px solid ${theme.accentColor}44` : '1px solid transparent',
                      fontFamily: 'Inter, sans-serif',
                      textAlign: 'left',
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
                <div className="flex items-center gap-2 px-3 py-2 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <MapPin size={14} style={{ color: theme.accentColor }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {weatherData.location.name}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search */}
      <div id="hero" className="relative z-10 max-w-6xl mx-auto px-4 pt-6 pb-2">
        <div className="flex gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <input
              type="text"
              placeholder="Search city…"
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm text-white placeholder:text-white/30"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                backdropFilter: 'blur(12px)',
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            disabled={searchLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold shrink-0"
            style={{
              background: theme.accentColor,
              color: '#080c1a',
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              cursor: searchLoading ? 'not-allowed' : 'pointer',
              opacity: searchLoading ? 0.7 : 1,
            }}
          >
            {searchLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Search
          </motion.button>
        </div>
        {searchError && (
          <p className="text-center text-sm mt-2" style={{ color: '#f87171' }}>{searchError}</p>
        )}
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-16 space-y-5 pt-4">
        <div id="current">
          <HeroSection data={weatherData} theme={theme} />
        </div>
        <div id="forecast">
          <ForecastSection data={weatherData} theme={theme} />
        </div>
        <div id="charts">
          <ChartsSection data={weatherData} theme={theme} />
        </div>
        <div id="sunmoon">
          <SunMoonSection data={weatherData} theme={theme} />
        </div>
        <div id="contact">
          <ContactSection theme={theme} />
        </div>
      </main>

      <footer className="relative z-10 text-center py-6 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace' }}>
          © 2025 Atoms Weather. All rights reserved.
        </p>
      </footer>

      {/* Weather Dot Navigation */}
      <WeatherDot data={weatherData} theme={theme} />

      {/* Global styles for navbar mode switcher */}
      <style>{`
        body.hide-navbar nav {
          transform: translateY(-100%) !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        body.show-navbar nav {
          transform: translateY(0) !important;
          opacity: 1 !important;
          pointer-events: all !important;
        }
      `}</style>
    </motion.div>
  );
}