import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Mail, User, MessageSquare, Tag, CheckCircle } from 'lucide-react';
import { WeatherTheme } from '../utils/weatherApi';

interface ContactSectionProps {
  theme: WeatherTheme;
}

export function ContactSection({ theme }: ContactSectionProps) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  const inputStyle = (field: string) => ({
    background: focused === field ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
    border: focused === field ? `1px solid ${theme.accentColor}88` : '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    outline: 'none',
    borderRadius: 12,
    padding: '12px 12px 12px 44px',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    transition: 'all 0.2s',
    boxShadow: focused === field ? `0 0 0 3px ${theme.accentGlow}` : 'none',
  });

  const iconColor = (field: string) =>
    focused === field ? theme.accentColor : 'rgba(255,255,255,0.3)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-3xl p-6 lg:p-8"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: info */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-white font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontSize: 28 }}>
              Get in Touch
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Have questions about our weather data, API integration, or want to share feedback? We'd love to hear from you.
            </p>

            {[
              { icon: Mail, label: 'Email', value: 'atoms@weather.in' },
              { icon: MessageSquare, label: 'Support', value: 'Available 24/7' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${theme.accentColor}22`, border: `1px solid ${theme.accentColor}33` }}
                >
                  <Icon size={18} style={{ color: theme.accentColor }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                  <p className="text-sm font-medium text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative blobs */}
          <div className="hidden lg:block relative h-40 mt-6 overflow-hidden rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div
              className="absolute w-48 h-48 rounded-full"
              style={{ background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`, top: -40, left: -20, filter: 'blur(30px)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontSize: 64, opacity: 0.4 }}>{theme.icon}</span>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full gap-4 py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              >
                <CheckCircle size={56} style={{ color: '#34d399' }} />
              </motion.div>
              <p className="text-white font-bold text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>Message Sent!</p>
              <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Thanks, {formData.name || 'friend'}! We'll get back to you soon.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: iconColor('name') }} />
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  style={inputStyle('name')}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: iconColor('email') }} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  style={inputStyle('email')}
                />
              </div>

              {/* Subject */}
              <div className="relative">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: iconColor('subject') }} />
                <input
                  type="text"
                  placeholder="Subject"
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  onFocus={() => setFocused('subject')}
                  onBlur={() => setFocused(null)}
                  style={inputStyle('subject')}
                />
              </div>

              {/* Message */}
              <div className="relative">
                <MessageSquare size={16} className="absolute left-3 top-4" style={{ color: iconColor('message') }} />
                <textarea
                  placeholder="Your message..."
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  style={{ ...inputStyle('message'), padding: '12px 12px 12px 44px', resize: 'none' }}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.accentColor}cc)`,
                  color: '#080c1a',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: `0 4px 24px ${theme.accentGlow}`,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Send size={16} />
                Send Message
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}