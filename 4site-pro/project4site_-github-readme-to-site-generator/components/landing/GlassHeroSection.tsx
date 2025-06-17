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
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      
      {/* Main glass container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-container w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl"
      >
        <div className="relative">
          {/* Glass layers */}
          <div className="absolute z-0 inset-0 backdrop-blur-md glass-filter overflow-hidden isolate rounded-3xl" />
          <div className="z-10 absolute inset-0 bg-white bg-opacity-15 rounded-3xl" />
          <div className="glass-inner-shadow rounded-3xl" />
          
          {/* Top Section - Logo & Welcome */}
          <div className="z-30 relative text-center bg-black/10 pt-6 sm:pt-8 lg:pt-12 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            {/* Progress Steps */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8"
            >
              <div className="flex items-center gap-2">
                <div className="glass-step active">
                  <div className="glass-step-content">1</div>
                </div>
                <span className="text-xs font-medium text-white/90 hidden md:block">Repository</span>
              </div>
              <div className="w-4 sm:w-6 h-px bg-white/30" />
              <div className="flex items-center gap-2">
                <div className="glass-step">
                  <div className="glass-step-content">2</div>
                </div>
                <span className="text-xs font-medium text-white/60 hidden md:block">Generation</span>
              </div>
              <div className="w-4 sm:w-6 h-px bg-white/30" />
              <div className="flex items-center gap-2">
                <div className="glass-step">
                  <div className="glass-step-content">3</div>
                </div>
                <span className="text-xs font-medium text-white/60 hidden md:block">Deployment</span>
              </div>
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
              className="mb-4 sm:mb-6"
            >
              <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden">
                <div className="absolute z-0 inset-0 backdrop-blur-sm glass-filter" />
                <div className="z-10 absolute inset-0 bg-gradient-to-br from-white/30 to-white/10" />
                <div className="glass-inner-shadow rounded-2xl" />
                <div className="z-30 relative flex items-center justify-center">
                  <img 
                    src="/4sitepro-logo.png" 
                    alt="4site.pro" 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain filter drop-shadow-lg"
                    onError={(e) => {
                      // Fallback to Modern3DIcon if logo fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.style.display = 'block';
                    }}
                  />
                  <div style={{display: 'none'}}>
                    <Modern3DIcon size={screenSize.width < 640 ? 48 : 60} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-tight mb-3 sm:mb-4">
                Transform GitHub Repo
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-white/90 mb-2 sm:mb-3">
                into <span className="font-medium bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Self-Updating</span> Website
              </p>
              <p className="text-xs sm:text-sm font-light text-white/70 max-w-xl lg:max-w-2xl mx-auto px-2">
                Let's transform your repository into a stunning website powered by aegntic.ai technology. 
                No signup required, instant generation with beautiful visuals.
              </p>
            </motion.div>
          </div>

          {/* Bottom Section - Form */}
          <div className="z-30 relative p-4 sm:p-6 lg:p-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mb-4 sm:mb-6"
            >
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-1 sm:mb-2">Enter your repository</h2>
              <p className="text-xs sm:text-sm font-normal text-white/70">Step 1 of 3 • Paste your GitHub repository URL below</p>
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
              className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
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
                  <div className="glass-card-content text-center py-2 sm:py-3">
                    <div className="text-xl sm:text-2xl mb-1">{feature.icon}</div>
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

      {/* Subtle floating glass elements for hero section */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-24 h-24 rounded-full opacity-30"
            style={{
              left: `${25 + i * 25}%`,
              top: `${20 + (i % 2) * 40}%`,
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)`,
              backdropFilter: 'blur(15px)',
              transform: `translate(${mousePosition.x * (5 + i * 2)}px, ${mousePosition.y * (3 + i)}px)`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 8, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1,
            }}
          />
        ))}
      </div>
    </section>
  );
};