import { motion } from 'motion/react';

export function LoadingScreen() {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}
    >
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: 'rgba(255,255,255,0.2)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -(Math.random() * 100 + 50)],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Fade-in Text Animation */}
      <div className="relative z-10 flex items-center justify-center px-4">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="font-black"
          style={{ 
            fontSize: 'clamp(3rem, 12vw, 8rem)',
            fontFamily: 'Inter, sans-serif',
            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 50%, #64748b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
            textShadow: '0 0 80px rgba(255,255,255,0.3)',
            lineHeight: '1.1',
            padding: '0 0.2em',
          }}
        >
          ATOMS
        </motion.h1>
      </div>

      {/* Radial glow bottom */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 pointer-events-none"
        style={{ 
          background: 'radial-gradient(ellipse at 50% 100%, rgba(148, 163, 184, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />
    </div>
  );
}