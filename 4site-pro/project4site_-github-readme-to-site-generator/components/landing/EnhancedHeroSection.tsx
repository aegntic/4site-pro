import React, { useEffect, useState } from 'react';
import { URLInputForm } from '../generator/URLInputForm';
import { motion } from 'framer-motion';
import { Icon } from '../ui/Icon';
import { Modern3DIcon } from '../ui/Modern3DIcon';
import { generateGEOContent } from '../../utils/seoHelpers';
import { LANDING_PAGE_VISUALS, generateLandingPageVisuals } from '../../services/landingPageVisuals';

interface EnhancedHeroSectionProps {
  onGenerateSite: (url: string) => void;
  onShowModeSelection?: () => void;
}

export const EnhancedHeroSection: React.FC<EnhancedHeroSectionProps> = ({ onGenerateSite, onShowModeSelection }) => {
  const [visuals, setVisuals] = useState(LANDING_PAGE_VISUALS);
  const [visualsLoading, setVisualsLoading] = useState(true);
  const geoContent = generateGEOContent('hero');

  useEffect(() => {
    // Try to generate unique visuals for the landing page
    generateLandingPageVisuals()
      .then(newVisuals => {
        setVisuals(newVisuals);
        setVisualsLoading(false);
      })
      .catch(() => {
        setVisualsLoading(false);
      });
  }, []);

  return (
    <section 
      className="relative min-h-screen flex items-center overflow-hidden"
      itemScope 
      itemType="https://schema.org/WebPageElement"
    >
      {/* SEO-optimized H1 (hidden visually but present for crawlers) */}
      <h1 className="sr-only" itemProp="headline">{geoContent.mainHeading}</h1>
      
      {/* AI-Generated Hero Background */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visualsLoading ? 0.3 : 0.7 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={visuals.heroImage}
            alt={visuals.heroImageAlt || "aegntic.ai-generated hero background for Project 4site"}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/85 to-gray-900" />
        </motion.div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-flow" />
      </div>

      {/* Floating Visual Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {visuals.colorPalette.map((color, index) => (
          <motion.div
            key={color}
            className="absolute w-64 h-64 rounded-full opacity-10"
            style={{
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              left: `${20 + index * 20}%`,
              top: `${10 + index * 15}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + index * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-5xl mx-auto text-center"
        >
          {/* 3D Modern Minimalist Project Icon */}
          <motion.div
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            className="mx-auto mb-8 relative inline-block"
            style={{ perspective: '1000px' }}
          >
            <Modern3DIcon size={100} className="relative z-10" />
          </motion.div>
          
          {/* Creative Animated Heading */}
          <motion.div className="mb-6">
            <motion.span
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="bg-gradient-to-r from-wu-gold via-white to-wu-gold bg-clip-text text-transparent animate-gradient-x">
                Transform
              </span>
              <span className="text-white mx-3">GitHub Repo</span>
            </motion.span>
            <motion.div
              className="text-4xl sm:text-5xl md:text-6xl font-bold mt-2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <span className="text-gray-400">into</span>
              <span className="mx-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-gradient-x">
                Self-Updating
              </span>
              <span className="text-white">Website</span>
            </motion.div>
          </motion.div>

          {/* SEO-Optimized Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 font-light"
            itemProp="description"
          >
            {geoContent.subHeading}
          </motion.p>

          {/* Feature Pills for GEO */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {['FLUX.1 Visuals', 'Background Removal', 'No Signup', '15 Seconds'].map((feature, index) => (
              <motion.span
                key={feature}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
                className="px-4 py-2 bg-gray-800/80 backdrop-blur border border-wu-gold/30 rounded-full text-sm font-medium text-gray-300 hover:border-wu-gold hover:text-white transition-all cursor-default"
              >
                {feature}
              </motion.span>
            ))}
          </motion.div>

          {/* URL Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <URLInputForm onSubmit={onGenerateSite} />
          </motion.div>

          {/* Advanced Mode Link */}
          {onShowModeSelection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="mt-8"
            >
              <button
                onClick={onShowModeSelection}
                className="group text-gray-400 hover:text-wu-gold font-medium transition-all duration-300"
              >
                Want premium features? Explore advanced modes
                <Icon name="ArrowRight" size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.8 }}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm"
          >
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={20} />
              <span>100% Privacy Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Zap" size={20} />
              <span>1,250+ Sites Created</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Star" size={20} />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={20} />
              <span>15s Average Time</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Tech Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {['React', 'Vue', 'Node', 'Python', 'Rust'].map((tech, index) => (
            <motion.div
              key={tech}
              className="absolute text-gray-600/20"
              style={{
                left: `${10 + index * 20}%`,
                top: `${20 + (index % 2) * 60}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 5 + index,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5,
              }}
            >
              <Icon name="Code2" size={40 + index * 5} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* CSS for gradient animations */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes grid-flow {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        
        .animate-grid-flow {
          animation: grid-flow 20s linear infinite;
        }
      `}</style>
    </section>
  );
};