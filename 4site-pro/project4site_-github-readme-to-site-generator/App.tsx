
import React, { useState, useCallback } from 'react';
import { GlassHeroSection } from './components/landing/GlassHeroSection';
import { GlassFeaturesSection } from './components/landing/GlassFeaturesSection';
import { GlassDemoSection } from './components/landing/GlassDemoSection';
import { GlassFooter } from './components/landing/GlassFooter';
import { GlassLoadingIndicator } from './components/generator/GlassLoadingIndicator';
import { LoadingIndicator } from './components/generator/LoadingIndicator';
import { SitePreview } from './components/generator/SitePreview';
import { EnhancedSitePreview } from './components/generator/EnhancedSitePreview';
import { DeepSitePreview } from './components/generator/DeepSitePreview';
import { DeepAnalysisProgress } from './components/generator/DeepAnalysisProgress';
import { GenerationModeSelector } from './components/landing/GenerationModeSelector';
import { Alert } from './components/ui/Alert';
import { SetupModeSelector } from './components/setup/SetupModeSelector';
import { AutoMode } from './components/modes/AutoMode';
import { SelectStyleMode } from './components/modes/SelectStyleMode';
import { CustomDesignMode } from './components/modes/CustomDesignMode';
import { generateSiteContentFromUrl } from './services/geminiService';
import { generateMultiModalSite, generateSiteWithRetry, GenerationProgress } from './services/multiModalOrchestrator';
import { DeepAnalysisOrchestrator, DeepAnalysisProgress as DeepProgress, DeepSiteData } from './services/deepAnalysisOrchestrator';
import { SiteData, AppState, Section, SetupMode } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { parseMarkdownToSections } from './services/markdownParser';

const App: React.FC = () => {
  console.log('App component rendering...');
  
  const [appState, setAppState] = useState<AppState>(AppState.Idle);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [deepSiteData, setDeepSiteData] = useState<DeepSiteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<SetupMode | null>(null);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [deepAnalysisProgress, setDeepAnalysisProgress] = useState<DeepProgress | null>(null);
  const [showGenerationMode, setShowGenerationMode] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string>('');

  const handleModeSelect = useCallback((mode: SetupMode) => {
    setSelectedMode(mode);
    switch (mode) {
      case SetupMode.Auto:
        setAppState(AppState.AutoMode);
        break;
      case SetupMode.SelectStyle:
        setAppState(AppState.SelectStyle);
        break;
      case SetupMode.CustomDesign:
        setAppState(AppState.CustomDesign);
        break;
    }
  }, []);

  const handleSkipToClassic = useCallback(() => {
    setAppState(AppState.Idle);
    setSelectedMode(null);
  }, []);

  const handleBackToModeSelection = useCallback(() => {
    setAppState(AppState.ModeSelection);
    setSelectedMode(null);
    setError(null);
    setSiteData(null);
  }, []);

  const handleGenerateSite = useCallback((url: string) => {
    if (!url.trim()) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    // Store the URL and show generation mode selector
    setPendingUrl(url);
    setShowGenerationMode(true);
  }, []);

  const handleGenerationModeSelect = useCallback(async (mode: 'quick' | 'deep') => {
    setShowGenerationMode(false);
    setRepoUrl(pendingUrl);
    setError(null);
    setSiteData(null);
    setDeepSiteData(null);
    setGenerationProgress(null);
    setDeepAnalysisProgress(null);

    if (mode === 'quick') {
      // Quick generation (existing logic)
      setAppState(AppState.Loading);
      try {
        console.log('Starting enhanced site generation with AI visuals...');
        const siteData = await generateSiteWithRetry(pendingUrl, (progress) => {
          setGenerationProgress(progress);
        });
        
        setSiteData(siteData);
        setAppState(AppState.Success);
        setGenerationProgress(null);
      } catch (err) {
        console.error("Error generating site:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while generating the site.";
        
        // If all attempts fail, try basic generation as final fallback
        console.log('All enhanced attempts failed, trying basic generation...');
        setError(null);
        setGenerationProgress({ stage: 'content', progress: 10, message: 'Falling back to basic generation...' });
        
        try {
          const markdown = await generateSiteContentFromUrl(pendingUrl);
          const sections = parseMarkdownToSections(markdown);
          const projectName = pendingUrl.split('/').pop() || 'Project';
          
          const basicSiteData: SiteData = {
            id: Date.now().toString(),
            title: projectName,
            repoUrl: pendingUrl,
            generatedMarkdown: markdown,
            sections,
            template: 'TechProjectTemplate',
            tier: 'free'
          };
          
          setSiteData(basicSiteData);
          setAppState(AppState.Success);
          setGenerationProgress(null);
          return;
        } catch (fallbackErr) {
          console.error("Basic generation also failed:", fallbackErr);
        }
        
        setError(`Failed to generate site: ${errorMessage}`);
        setAppState(AppState.Error);
        setGenerationProgress(null);
      }
    } else {
      // Deep analysis mode
      setAppState(AppState.Loading);
      try {
        console.log('Starting deep repository analysis...');
        const deepAnalyzer = new DeepAnalysisOrchestrator(import.meta.env.VITE_GITHUB_TOKEN);
        const deepData = await deepAnalyzer.generateDeepSite(pendingUrl, (progress) => {
          setDeepAnalysisProgress(progress);
        });
        
        setDeepSiteData(deepData);
        setAppState(AppState.Success);
        setDeepAnalysisProgress(null);
      } catch (err) {
        console.error("Deep analysis failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Deep analysis failed. Please try quick generation instead.";
        setError(errorMessage);
        setAppState(AppState.Error);
        setDeepAnalysisProgress(null);
      }
    }
  }, [pendingUrl]);

  const handleSiteGenerated = useCallback((generatedSiteData: SiteData) => {
    setSiteData(generatedSiteData);
    setAppState(AppState.Success);
  }, []);

  const handleReset = () => {
    setAppState(AppState.Idle);
    setSiteData(null);
    setDeepSiteData(null);
    setError(null);
    setRepoUrl('');
    setSelectedMode(null);
    setGenerationProgress(null);
    setDeepAnalysisProgress(null);
    setPendingUrl('');
  };

  const handleShowModeSelection = () => {
    setAppState(AppState.ModeSelection);
  };

  console.log('App render - appState:', appState);

  return (
    <div className="min-h-screen flex flex-col bg-gh-bg-primary text-gh-text-primary relative overflow-hidden">
      <AnimatePresence mode="wait">
        {appState === AppState.Idle && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-grow flex flex-col"
          >
            <GlassHeroSection onGenerateSite={handleGenerateSite} onShowModeSelection={handleShowModeSelection} />
            <GlassFeaturesSection />
            <GlassDemoSection />
          </motion.div>
        )}

        {appState === AppState.ModeSelection && (
          <motion.div
            key="mode-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SetupModeSelector
              onModeSelect={handleModeSelect}
              onSkipToClassic={handleSkipToClassic}
            />
          </motion.div>
        )}

        {appState === AppState.AutoMode && (
          <motion.div
            key="auto-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AutoMode
              onSiteGenerated={handleSiteGenerated}
              onBack={handleBackToModeSelection}
            />
          </motion.div>
        )}

        {appState === AppState.SelectStyle && (
          <motion.div
            key="select-style"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SelectStyleMode
              onSiteGenerated={handleSiteGenerated}
              onBack={handleBackToModeSelection}
            />
          </motion.div>
        )}

        {appState === AppState.CustomDesign && (
          <motion.div
            key="custom-design"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CustomDesignMode
              onSiteGenerated={handleSiteGenerated}
              onBack={handleBackToModeSelection}
            />
          </motion.div>
        )}

        {appState === AppState.Loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-grow flex items-center justify-center p-4"
          >
            {deepAnalysisProgress ? (
              <DeepAnalysisProgress progress={deepAnalysisProgress} />
            ) : (
              <GlassLoadingIndicator 
                message="Crafting your enhanced project site with aegntic.ai-generated visuals..." 
                progress={generationProgress || undefined}
              />
            )}
          </motion.div>
        )}

        {(appState === AppState.Success || appState === AppState.Error) && (siteData || deepSiteData) && (
           <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-grow"
          >
            {deepSiteData ? (
              <DeepSitePreview siteData={deepSiteData} onReset={handleReset} error={error} />
            ) : siteData?.visuals ? (
              <EnhancedSitePreview siteData={siteData} onReset={handleReset} error={error} />
            ) : siteData ? (
              <SitePreview siteData={siteData} onReset={handleReset} error={error} />
            ) : null}
          </motion.div>
        )}
        
        {/* Error state without siteData or deepSiteData (e.g. initial URL validation error or catastrophic failure) */}
        {appState === AppState.Error && !siteData && !deepSiteData && (
          <motion.div
            key="error_full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-grow flex flex-col items-center justify-center p-4"
          >
            <div className="max-w-md w-full">
              <Alert type="error" message={error || "An unexpected error occurred."} />
              <button
                onClick={handleReset}
                className="mt-4 w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors duration-150"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Generation Mode Selector Modal */}
      {showGenerationMode && (
        <GenerationModeSelector
          onSelectMode={handleGenerationModeSelect}
          onClose={() => setShowGenerationMode(false)}
        />
      )}
      
      {(appState === AppState.Idle || appState === AppState.Error) && <GlassFooter />}
    </div>
  );
};

export default App;
