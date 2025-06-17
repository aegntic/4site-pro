import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSiteContentFromUrl } from './services/geminiService';
import { generateDemoSite } from './services/demoService';
import { SiteData, AppState } from './types';
import { SimplePreviewTemplate } from './components/templates/SimplePreviewTemplate';
import './index.css';
import './styles/glassmorphism.css';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Idle);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showDeployPopup, setShowDeployPopup] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    // Check for API key
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      setError('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.');
      setAppState(AppState.Error);
      return;
    }

    setLoading(true);
    setError(null);
    setAppState(AppState.Loading);

    try {
      const data = await generateSiteContentFromUrl(repoUrl);
      
      // Ensure we have a valid SiteData object, not a string
      if (!data || typeof data === 'string') {
        throw new Error('Invalid response from content generator');
      }
      
      setSiteData(data);
      setAppState(AppState.Success);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate site');
      setAppState(AppState.Error);
    } finally {
      setLoading(false);
    }
  }, [repoUrl]);

  const handleReset = useCallback(() => {
    setAppState(AppState.Idle);
    setSiteData(null);
    setError(null);
    setRepoUrl('');
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.1)_0%,transparent_70%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <img 
                  src="/4sitepro-logo.png" 
                  alt="4site.pro" 
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-xl font-bold bg-gradient-to-r from-white to-yellow-400 bg-clip-text text-transparent">
                  project4site
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Features
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Pricing
                </button>
                <button className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:shadow-lg hover:shadow-yellow-400/25 transition-all">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {appState === AppState.Idle && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            {/* Hero Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-20"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                  Transform GitHub Repos
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Into Premium Websites
                </span>
              </h1>
              <p className="text-xl text-white/60 mb-12 max-w-3xl mx-auto">
                AI-powered site generation that creates stunning, production-ready websites 
                from your GitHub repositories in under 30 seconds.
              </p>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                  <div className="relative flex items-center backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-2">
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="Enter GitHub repository URL..."
                      className="flex-1 bg-transparent px-6 py-4 text-white placeholder-white/40 focus:outline-none"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !repoUrl.trim()}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-yellow-400/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Generating...' : 'Generate Site'}
                    </button>
                  </div>
                </div>
              </form>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </motion.section>

            {/* Features Grid */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
            >
              {[
                { icon: '⚡', title: 'Lightning Fast', desc: 'Generate complete websites in under 30 seconds' },
                { icon: '🎨', title: 'Premium Design', desc: 'Beautiful, modern templates with glass morphism UI' },
                { icon: '🤖', title: 'AI-Powered', desc: 'Advanced AI analyzes your code and creates perfect content' },
                { icon: '📱', title: 'Fully Responsive', desc: 'Looks perfect on all devices, from mobile to 8K displays' },
                { icon: '🚀', title: 'Deploy Anywhere', desc: 'Export to Vercel, Netlify, or download the code' },
                { icon: '🔒', title: 'Enterprise Security', desc: 'SOC2 compliant with end-to-end encryption' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.section>
          </main>
        )}

        {appState === AppState.Loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl text-white/60">Analyzing repository...</p>
            </div>
          </div>
        )}

        {appState === AppState.Success && siteData && (
          <div className="relative">
            {/* Site Preview */}
            <SimplePreviewTemplate siteData={siteData} />
            
            {/* Floating Action Bar */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
              <div className="backdrop-blur-xl bg-black/20 rounded-2xl border border-white/20 p-4 flex gap-3">
                <button 
                  onClick={() => setShowDeployPopup(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all"
                >
                  🚀 Deploy to GitHub Pages
                </button>
                <button 
                  onClick={handleReset}
                  className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                >
                  🔄 Retry
                </button>
                <button 
                  onClick={() => setShowDeployPopup(true)}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>

            {/* Deployment Popup */}
            <AnimatePresence>
              {showDeployPopup && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowDeployPopup(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">Deploy Your Site</h3>
                    
                    <div className="space-y-4">
                      <button className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-3">
                        <span className="text-xl">🚀</span>
                        <div className="text-left">
                          <div className="font-semibold">Deploy to GitHub Pages</div>
                          <div className="text-sm opacity-80">Free hosting on GitHub</div>
                        </div>
                      </button>
                      
                      <button className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3">
                        <span className="text-xl">✏️</span>
                        <div className="text-left">
                          <div className="font-semibold">Edit Site</div>
                          <div className="text-sm opacity-80">Customize before deploying</div>
                        </div>
                      </button>
                      
                      <button 
                        onClick={handleReset}
                        className="w-full p-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-3"
                      >
                        <span className="text-xl">🔄</span>
                        <div className="text-left">
                          <div className="font-semibold">Generate Another</div>
                          <div className="text-sm opacity-80">Try a different repository</div>
                        </div>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => setShowDeployPopup(false)}
                      className="absolute top-4 right-4 text-white/60 hover:text-white text-xl"
                    >
                      ✕
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;