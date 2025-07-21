import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassHeroSection } from '../landing/GlassHeroSection';
import { GlassFeaturesSection } from '../landing/GlassFeaturesSection';
import { TierPricingSection } from '../pricing/TierPricingSection';
import { PolarIntegrationSection } from '../integration/PolarIntegrationSection';
import { GlassFooter } from '../landing/GlassFooter';

interface UpdatedMainSectionProps {
  onGenerateSite: (url: string) => void;
  onSelectTier?: (tier: string) => void;
  onUpgrade?: (tier: string) => void;
}

export const UpdatedMainSection: React.FC<UpdatedMainSectionProps> = ({ 
  onGenerateSite, 
  onSelectTier, 
  onUpgrade 
}) => {
  const [activeSection, setActiveSection] = useState('hero');

  return (
    <div className="relative">
      {/* Updated Hero Section */}
      <GlassHeroSection 
        onGenerateSite={onGenerateSite} 
        onShowModeSelection={() => setActiveSection('pricing')}
      />

      {/* Updated Features Section */}
      <GlassFeaturesSection />

      {/* New Pricing Section */}
      <TierPricingSection onSelectTier={onSelectTier} />

      {/* Polar.sh Integration Section */}
      <PolarIntegrationSection onUpgrade={onUpgrade} />

      {/* Value Proposition Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card"
          >
            <div className="glass-card-content p-8 text-center">
              <h2 className="text-3xl font-light text-white mb-6">
                The Real Innovation: <span className="font-medium bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Automated Content Creation</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="text-4xl mb-3">🏗️</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Focus on Building</h3>
                  <p className="text-sm text-white/70">Concentrate on what you do best - developing great software. We handle the content creation automatically.</p>
                </div>
                <div>
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Automated Blog Posts</h3>
                  <p className="text-sm text-white/70">Your website creates professional blog posts at development milestones without any manual effort.</p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🌟</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Professional Recognition</h3>
                  <p className="text-sm text-white/70">Build visibility among industry leaders through quality work and professional presentation.</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-white mb-4">"Complement Not Complicate" Philosophy</h4>
                <p className="text-white/80 leading-relaxed">
                  Every feature enhances your existing development workflow without adding unnecessary complexity. 
                  We integrate seamlessly with GitHub, amplify what you're already building, and never force new processes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Network Effects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light text-white mb-4">
              Network <span className="font-medium bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Visibility</span> Benefits
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Professional recognition and collaboration opportunities through our curated network of industry leaders.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card"
            >
              <div className="glass-card-content p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🆓 FREE Tier (5 websites)</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Elegant PRO member featuring (no ads)</li>
                  <li>• Professional templates and design</li>
                  <li>• Get online instantly while learning</li>
                  <li>• Automated content at dev checkpoints</li>
                  <li>• 2-minute generation with standard AI</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card ring-2 ring-yellow-400/50"
            >
              <div className="glass-card-content p-6">
                <h3 className="text-xl font-semibold text-white mb-4">💼 PRO Tier ($49.49/month)</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• 111 auto-updating websites + 11 gift websites</li>
                  <li>• Network visibility among industry leaders</li>
                  <li>• Featured in professional galleries</li>
                  <li>• Sub 1-minute generation (premium AI)</li>
                  <li>• Professional recognition and credibility</li>
                  <li>• Remove platform attribution completely</li>
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="glass-card max-w-2xl mx-auto">
              <div className="glass-card-content p-6">
                <h4 className="text-lg font-semibold text-white mb-3">💡 Important Note</h4>
                <p className="text-sm text-white/80 italic">
                  We focus on professional visibility and network recognition, not financial promises. 
                  Our value is in building your reputation and connecting you with industry leaders.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <GlassFooter />
    </div>
  );
};