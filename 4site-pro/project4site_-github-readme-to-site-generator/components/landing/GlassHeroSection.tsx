import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Modern3DIcon } from '../ui/Modern3DIcon';
import { GlassURLInputForm } from '../generator/GlassURLInputForm';

interface GlassHeroSectionProps {
  onGenerateSite: (url: string) => void;
  onShowModeSelection?: () => void;
}

export const GlassHeroSection: React.FC<GlassHeroSectionProps> = ({ onGenerateSite, onShowModeSelection }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic background with parallax effect */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635151227785-429f420c6b9d?w=2160&q=80')] bg-cover bg-center"
        style={{
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px) scale(1.1)`,
          transition: 'transform 0.2s ease-out'
        }}
      />
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 glass-background" />
      
      {/* Main glass container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-container max-w-4xl w-full mx-4"
      >
        <div className="relative">
          {/* Glass layers */}
          <div className="absolute z-0 inset-0 backdrop-blur-md glass-filter overflow-hidden isolate rounded-3xl" />
          <div className="z-10 absolute inset-0 bg-white bg-opacity-15 rounded-3xl" />
          <div className="glass-inner-shadow rounded-3xl" />
          
          {/* Top Section - Logo & Welcome */}
          <div className="z-30 relative text-center bg-black/10 pt-12 px-8 pb-8">
            {/* Progress Steps */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="flex items-center gap-2">
                <div className="glass-step active">
                  <div className="glass-step-content">1</div>
                </div>
                <span className="text-xs font-medium text-white/90 hidden sm:block">Repository</span>
              </div>
              <div className="w-6 h-px bg-white/30" />
              <div className="flex items-center gap-2">
                <div className="glass-step">
                  <div className="glass-step-content">2</div>
                </div>
                <span className="text-xs font-medium text-white/60 hidden sm:block">Generation</span>
              </div>
              <div className="w-6 h-px bg-white/30" />
              <div className="flex items-center gap-2">
                <div className="glass-step">
                  <div className="glass-step-content">3</div>
                </div>
                <span className="text-xs font-medium text-white/60 hidden sm:block">Deployment</span>
              </div>
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
              className="mb-6"
            >
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden">
                <div className="absolute z-0 inset-0 backdrop-blur-sm glass-filter" />
                <div className="z-10 absolute inset-0 bg-gradient-to-br from-white/30 to-white/10" />
                <div className="glass-inner-shadow rounded-2xl" />
                <div className="z-30 relative">
                  <Modern3DIcon size={60} />
                </div>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h1 className="text-5xl sm:text-6xl font-light text-white tracking-tight mb-4">
                Transform GitHub Repo
              </h1>
              <p className="text-3xl sm:text-4xl font-normal text-white/90 mb-3">
                into <span className="font-medium bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Self-Updating</span> Website
              </p>
              <p className="text-sm font-light text-white/70 max-w-2xl mx-auto">
                Let's transform your repository into a stunning website powered by aegntic.ai technology. 
                No signup required, instant generation with beautiful visuals.
              </p>
            </motion.div>
          </div>

          {/* Bottom Section - Form */}
          <div className="z-30 relative p-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-medium text-white mb-2">Enter your repository</h2>
              <p className="text-sm font-normal text-white/70">Step 1 of 3 • Paste your GitHub repository URL below</p>
            </motion.div>

            {/* URL Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <GlassURLInputForm onSubmit={onGenerateSite} />
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: '✨', label: 'FLUX.1 Visuals' },
                { icon: '🔄', label: 'Self-Updating' },
                { icon: '⚡', label: '15 Seconds' },
                { icon: '🔒', label: 'Privacy Safe' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="glass-card"
                >
                  <div className="glass-card-content text-center py-3">
                    <div className="text-2xl mb-1">{feature.icon}</div>
                    <div className="text-xs font-medium text-white/80">{feature.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Advanced Mode Link */}
            {onShowModeSelection && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="mt-8 text-center"
              >
                <button
                  onClick={onShowModeSelection}
                  className="text-sm font-normal text-white/70 hover:text-white transition-colors group"
                >
                  Want premium features? 
                  <span className="text-white font-medium ml-1 group-hover:underline">
                    Explore advanced modes →
                  </span>
                </button>
              </motion.div>
            )}

            {/* Footer Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-12 text-center"
            >
              <p className="text-sm font-normal text-white/70 mb-3">
                Already have a site? 
                <a href="#" className="text-white hover:opacity-80 transition-opacity font-semibold ml-1">
                  View dashboard
                </a>
              </p>
              <div className="flex gap-4 text-xs font-normal text-white/50 items-center justify-center">
                <a href="https://aegntic.ai" className="hover:text-white/70 transition-colors">aegntic.ai</a>
                <span>•</span>
                <a href="https://aegntic.foundation" className="hover:text-white/70 transition-colors">aegntic.foundation</a>
                <span>•</span>
                <a href="mailto:project@4site.pro" className="hover:text-white/70 transition-colors">Contact</a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Floating glass elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 2) * 60}%`,
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)`,
              backdropFilter: 'blur(10px)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </section>
  );
};