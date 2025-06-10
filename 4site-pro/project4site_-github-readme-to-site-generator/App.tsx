
import React, { useState, useCallback } from 'react';
import { HeroSection } from './components/landing/HeroSection';
import { FeaturesSection } from './components/landing/FeaturesSection';
import { DemoSection } from './components/landing/DemoSection';
import { Footer } from './components/landing/Footer';
import { LoadingIndicator } from './components/generator/LoadingIndicator';
import { SitePreview } from './components/generator/SitePreview';
import { Alert } from './components/ui/Alert';
import { generateSiteContentFromUrl } from './services/geminiService';
import { SiteData, AppState, Section } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { parseMarkdownToSections } from './services/markdownParser';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Idle);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string>('');

  const handleGenerateSite = useCallback(async (url: string) => {
    if (!url.trim()) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    setRepoUrl(url);
    setAppState(AppState.Loading);
    setError(null);
    setSiteData(null);

    try {
      const rawMarkdown = await generateSiteContentFromUrl(url);
      if (!rawMarkdown) {
        throw new Error("Failed to generate content. The AI might have returned an empty response.");
      }
      
      const sections = parseMarkdownToSections(rawMarkdown);
      
      // Extract title from the first H1, or use a default
      let title = "My Project";
      const firstSectionContent = sections[0]?.content || "";
      const titleMatch = firstSectionContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1];
      } else {
         // Fallback: try to get title from the first line of raw markdown if it's a heading
        const rawTitleMatch = rawMarkdown.match(/^#\s+(.*)/);
        if (rawTitleMatch && rawTitleMatch[1]) {
          title = rawTitleMatch[1];
        } else {
          // Fallback to repo name from URL
          const pathParts = new URL(url).pathname.split('/');
          if (pathParts.length >= 2) {
            title = pathParts[pathParts.length -1] || pathParts[pathParts.length - 2] || "My Project";
            title = title.replace(/\.git$/, ''); // Remove .git if present
          }
        }
      }
      
      const newSiteData: SiteData = {
        id: Date.now().toString(), // Simple ID for client-side
        title: title,
        repoUrl: url,
        generatedMarkdown: rawMarkdown,
        sections: sections,
        template: 'TechProjectTemplate', // Default template
        partnerToolRecommendations: [ // Placeholder partner tools
          { name: "Vercel", description: "Deploy your project with ease.", ctaUrl: "https://vercel.com", iconUrl: "https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico" },
          { name: "Sentry", description: "Monitor your application for errors.", ctaUrl: "https://sentry.io", iconUrl: "https://sentry-brand.storage.googleapis.com/favicon.ico" },
          { name: "Stripe", description: "Integrate payments into your project.", ctaUrl: "https://stripe.com", iconUrl: "https://stripe.com/favicon.ico" },
        ]
      };
      setSiteData(newSiteData);
      setAppState(AppState.Success);
    } catch (err) {
      console.error("Error generating site:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while generating the site. Check console for details.";
      setError(`Failed to generate site: ${errorMessage}. The AI model might be unavailable or the repository URL might be inaccessible. Please try again or use a different URL.`);
      setAppState(AppState.Error);
    }
  }, []);

  const handleReset = () => {
    setAppState(AppState.Idle);
    setSiteData(null);
    setError(null);
    setRepoUrl('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-slate-100">
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
            <HeroSection onGenerateSite={handleGenerateSite} />
            <FeaturesSection />
            <DemoSection />
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
            <LoadingIndicator message="Crafting your project site... This might take a moment." />
          </motion.div>
        )}

        {(appState === AppState.Success || appState === AppState.Error) && siteData && (
           <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-grow"
          >
            <SitePreview siteData={siteData} onReset={handleReset} error={error} />
          </motion.div>
        )}
        
        {/* Error state without siteData (e.g. initial URL validation error or catastrophic failure) */}
        {appState === AppState.Error && !siteData && (
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
      <Footer />
    </div>
  );
};

export default App;
