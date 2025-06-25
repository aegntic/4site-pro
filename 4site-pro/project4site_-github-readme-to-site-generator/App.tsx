import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSiteContentFromUrl } from './services/geminiService';
import { SiteData, AppState } from './types';
import { useAuth } from './contexts/AuthContext';
import { useGenerationTracking } from './hooks/useGenerationTracking';
import { performSystemHealthCheck } from './utils/healthCheck';
import { useRetry } from './hooks/useRetry';
import { useComponentPerformance, useMemoizedValue, useDebouncedState } from './hooks/usePerformance';
import { useServiceWorker, cacheUtils } from './utils/serviceWorker';
import { 
  LazyWrapper, 
  SimplePreviewTemplate,
  LoginModal,
  ConversionPrompt,
  ErrorBoundary,
  FloatingFeedbackButton,
  AIGenerationLoader,
  preloadComponents
} from './components/LazyComponents';
import CommissionDashboard from './components/admin/CommissionDashboard';
import { PerformanceMonitor, usePerformanceMonitor } from './components/monitoring/PerformanceMonitor';
import { UpdatedMainSection } from './components/sections/UpdatedMainSection';
import './index.css';
import './styles/glassmorphism.css';
import './styles/developer-brand.css';
import './styles/enterprise-professional.css';

const App: React.FC = () => {
  // Performance monitoring
  const metrics = useComponentPerformance('App');
  const { isVisible: perfMonitorVisible, toggle: togglePerfMonitor } = usePerformanceMonitor();
  
  // Service worker integration
  const { status: swStatus, prefetchUrls } = useServiceWorker();
  
  // Auth and tracking
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const {
    anonymousGenerations,
    showSignupPrompt,
    setShowSignupPrompt,
    trackGeneration
  } = useGenerationTracking();
  
  // Core state
  const [appState, setAppState] = useState<AppState>(AppState.Idle);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeployPopup, setShowDeployPopup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  
  // Optimized state with debouncing
  const [debouncedRepoUrl, setRepoUrl, repoUrl] = useDebouncedState<string>('', 150);
  const [debouncedPreviewUrl, setPreviewUrl, previewUrl] = useDebouncedState<string>('', 100);
  const [loading, setLoading] = useState(false);
  
  // Memoized values
  const showPreview = useMemoizedValue(() => {
    return debouncedPreviewUrl.length > 0;
  }, [debouncedPreviewUrl], 'showPreview');

  // Check if user is admin (simplified check for demo - would use proper role-based auth in production)
  const isAdmin = useMemoizedValue(() => {
    return user?.email?.includes('admin') || user?.email?.includes('tabs') || showAdminDashboard;
  }, [user?.email, showAdminDashboard], 'isAdmin');

  // Enhanced site generation with retry logic
  const { execute: executeGeneration, isRetrying, currentAttempt } = useRetry(
    generateSiteContentFromUrl,
    {
      maxAttempts: 3,
      delay: 2000,
      backoff: 'exponential',
      shouldRetry: (error, attempt) => {
        // Retry on network errors and timeouts
        const retryableErrors = ['NetworkError', 'TypeError', 'TimeoutError'];
        const message = error.message.toLowerCase();
        return (
          attempt < 3 && 
          (retryableErrors.includes(error.name) || 
           message.includes('network') || 
           message.includes('timeout') ||
           message.includes('fetch'))
        );
      },
      onRetry: (error, attempt) => {
        console.log(`Retrying site generation (attempt ${attempt}):`, error.message);
      }
    }
  );

  // Performance optimizations
  useEffect(() => {
    // Preload components when user starts interacting
    if (repoUrl.length > 3) {
      preloadComponents.preloadTemplates();
    }
    
    // Preload auth components for unauthenticated users
    if (!user && repoUrl.length > 0) {
      preloadComponents.preloadAuth();
    }
    
    // Prefetch critical resources
    if (swStatus.activated) {
      prefetchUrls([
        '/4sitepro-logo.png',
        '/ae4sitepro-assets/branding/'
      ]);
    }
  }, [repoUrl, user, swStatus.activated, prefetchUrls]);

  // Memoized URL processing function
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepoUrl(value);
    
    // Process URL patterns with memoized logic
    let expandedUrl = '';
    
    if (value.match(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)) {
      expandedUrl = `https://github.com/${value}`;
    } else if (value.match(/^github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)) {
      expandedUrl = `https://${value}`;
    } else if (value.startsWith('github.com/')) {
      expandedUrl = `https://${value}`;
    }
    
    setPreviewUrl(expandedUrl);
  }, [setRepoUrl, setPreviewUrl]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debouncedRepoUrl.trim()) return;

    // Smart URL processing - automatically format GitHub repository shortcuts
    let processedUrl = debouncedRepoUrl.trim();
    
    // Convert "owner/repo" format to full GitHub URL
    if (processedUrl.match(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)) {
      processedUrl = `https://github.com/${processedUrl}`;
    }
    // Convert "github.com/owner/repo" to full URL
    else if (processedUrl.match(/^github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)) {
      processedUrl = `https://${processedUrl}`;
    }
    // Ensure https:// prefix for other github.com URLs
    else if (processedUrl.startsWith('github.com/')) {
      processedUrl = `https://${processedUrl}`;
    }

    // Update the display URL
    setRepoUrl(processedUrl);

    // OpenRouter API key is handled automatically in the service
    // No need for manual API key validation here

    setLoading(true);
    setError(null);
    setAppState(AppState.Loading);
    setGenerationStartTime(Date.now());

    try {
      const data = await executeGeneration(processedUrl);
      
      // Ensure we have a valid SiteData object, not a string
      if (!data || typeof data === 'string') {
        throw new Error('Invalid response from content generator');
      }
      
      setSiteData(data);
      setAppState(AppState.Success);
      
      // Track generation for anonymous users (conversion trigger)
      trackGeneration();
    } catch (err) {
      console.error('Generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate site';
      
      // Enhanced error message with retry information
      if (isRetrying) {
        setError(`${errorMessage} (Retrying... attempt ${currentAttempt}/3)`);
      } else {
        setError(errorMessage);
      }
      
      setAppState(AppState.Error);
    } finally {
      setLoading(false);
      setGenerationStartTime(null);
    }
  }, [debouncedRepoUrl, executeGeneration, isRetrying, currentAttempt, trackGeneration]);

  const handleReset = useCallback(() => {
    setAppState(AppState.Idle);
    setSiteData(null);
    setError(null);
    setRepoUrl('');
    setPreviewUrl('');
    setShowPreview(false);
  }, []);

  // Handle conversion prompt actions
  const handleSignUpFromPrompt = useCallback(() => {
    setShowSignupPrompt(false);
    setShowLoginModal(true);
  }, [setShowSignupPrompt]);

  // Health check endpoint - accessible via ?health=true
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('health') === 'true') {
      performSystemHealthCheck().then(health => {
        console.log('System Health Check:', health);
        // Replace page content with health check results in JSON format for monitoring
        document.body.innerHTML = `<pre style="font-family: monospace; padding: 20px; background: #0f0f0f; color: #00ff00;">${JSON.stringify(health, null, 2)}</pre>`;
      });
    }
  }, []);

  return (
    <LazyWrapper fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-lg">Loading 4site.pro...</div>
      </div>
    }>
      <ErrorBoundary>
        <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.1)_0%,transparent_70%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Developer-Friendly Navigation */}
        <nav className="sticky top-0 z-50 bg-glass border-b border-[var(--border-primary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--vs-code-blue)] to-[var(--terminal-green)] rounded font-mono text-xs flex items-center justify-center text-[var(--text-primary)] font-bold">
                  4S
                </div>
                <span className="text-xl font-bold font-mono text-[var(--text-primary)]">
                  <span className="text-[var(--vs-code-blue)]">project</span>
                  <span className="text-[var(--terminal-green)]">4site</span>
                  <span className="text-[var(--syntax-comment)]">.pro</span>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 text-sm font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <span className="text-[var(--syntax-comment)]">#</span> features
                </button>
                <button className="px-4 py-2 text-sm font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <span className="text-[var(--syntax-comment)]">$</span> pricing
                </button>
                
                {/* Admin Dashboard Access */}
                {isAdmin && (
                  <button 
                    onClick={() => setShowAdminDashboard(!showAdminDashboard)}
                    className={`px-4 py-2 text-sm font-mono transition-colors ${
                      showAdminDashboard 
                        ? 'text-[var(--terminal-green)] bg-[var(--terminal-green)]/10' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-[var(--syntax-comment)]">@</span> admin
                  </button>
                )}
                
                {/* Authentication Controls */}
                {authLoading ? (
                  <div className="w-8 h-8 border-2 border-[var(--vs-code-blue)] border-t-transparent rounded-full animate-spin"></div>
                ) : user ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-[var(--text-secondary)]">
                      {profile?.tier && (
                        <span className="px-2 py-1 text-xs bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded font-mono">
                          {profile.tier}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[var(--text-primary)] font-mono">
                      {user.email}
                    </div>
                    <button 
                      onClick={signOut}
                      className="px-4 py-2 text-sm font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      logout
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 text-sm font-mono rounded-lg bg-[var(--interactive-primary)] text-[var(--text-inverse)] hover:bg-[var(--interactive-primary-hover)] transition-all"
                  >
                    auth
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Admin Dashboard */}
        {showAdminDashboard && (
          <LazyWrapper>
            <CommissionDashboard />
          </LazyWrapper>
        )}

        {!showAdminDashboard && appState === AppState.Idle && (
          <main>
            {/* Updated Main Section with all modernized components */}
            <UpdatedMainSection 
              onGenerateSite={(repoUrl) => {
                setRepoUrl(repoUrl);
                setPreviewUrl(repoUrl.includes('github.com') ? repoUrl : `https://github.com/${repoUrl}`);
                // Trigger form submission automatically
                setTimeout(() => {
                  const form = document.querySelector('form') as HTMLFormElement;
                  if (form) form.requestSubmit();
                }, 100);
              }}
              onSelectTier={(tier) => {
                console.log('Selected tier:', tier);
                // Handle tier selection
              }}
              onUpgrade={(tier) => {
                console.log('Upgrade to tier:', tier);
                // Handle upgrade action
              }}
            />

            {/* Error Display */}
            {error && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-glass border border-red-500/30 rounded-lg text-red-400 mb-8"
                >
                  <div className="font-mono text-sm">
                    <span className="text-gray-500"># Error:</span> {error}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Hidden form for programmatic submission */}
            <form onSubmit={handleSubmit} style={{ display: 'none' }}>
              <input type="text" value={debouncedRepoUrl} readOnly />
              <button type="submit">Submit</button>
            </form>
          </main>
        )}

        {!showAdminDashboard && appState === AppState.Loading && (
          <div className="flex items-center justify-center min-h-screen">
            <LazyWrapper>
              <AIGenerationLoader
                isLoading={true}
                stage={isRetrying ? 'retrying' : 'analyzing'}
                progress={isRetrying ? (currentAttempt / 3) * 100 : 25}
                message={isRetrying ? `Retrying generation (${currentAttempt}/3)` : 'Analyzing repository and generating site...'}
                substeps={[
                  'Fetching repository data',
                  'Analyzing README content',
                  'Processing with AI',
                  'Generating site structure',
                  'Finalizing design'
                ]}
                estimatedTime={30000}
                startTime={generationStartTime || undefined}
              />
            </LazyWrapper>
          </div>
        )}

        {!showAdminDashboard && appState === AppState.Success && siteData && (
          <div className="relative">
            {/* Demo Mode Banner */}
            {siteData.generatedBy === 'demo-mode' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
              >
                <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl px-6 py-3 text-center">
                  <div className="flex items-center gap-2 text-yellow-300">
                    <span className="text-lg">🎭</span>
                    <span className="font-semibold">Demo Mode Active</span>
                    <span className="text-lg">🎭</span>
                  </div>
                  <p className="text-xs text-yellow-200/80 mt-1">
                    This is a preview of what your generated site would look like. Get your OpenRouter API key to unlock full AI generation!
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Site Preview */}
            <LazyWrapper>
              <SimplePreviewTemplate siteData={siteData} />
            </LazyWrapper>
            
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

        {/* Login Modal */}
        {showLoginModal && (
          <LazyWrapper>
            <LoginModal 
              isOpen={showLoginModal} 
              onClose={() => setShowLoginModal(false)} 
            />
          </LazyWrapper>
        )}

        {/* Conversion Prompt */}
        {showSignupPrompt && (
          <LazyWrapper>
            <ConversionPrompt
              isOpen={showSignupPrompt}
              onClose={() => setShowSignupPrompt(false)}
              onSignUp={handleSignUpFromPrompt}
              generationCount={anonymousGenerations}
            />
          </LazyWrapper>
        )}

        {/* Floating Feedback Button */}
        <LazyWrapper>
          <FloatingFeedbackButton />
        </LazyWrapper>

        {/* Performance Monitor */}
        <PerformanceMonitor 
          isVisible={perfMonitorVisible} 
          onToggle={togglePerfMonitor} 
        />
        </div>
      </div>
      </ErrorBoundary>
    </LazyWrapper>
  );
};

export default App;