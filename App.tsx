import React, { useState, useCallback } from 'react';
import { generateSiteContentFromUrl } from './services/geminiService';
import { SiteData } from './types';
import './index.css';

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);

  const handleGeneration = useCallback(async () => {
    if (!repoUrl.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateSiteContentFromUrl(repoUrl);
      setSiteData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl]);

  if (siteData) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => setSiteData(null)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ← Back to generator
            </button>
          </div>
          <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
            <div className="p-8">
              <h1 className="text-4xl font-bold mb-4 text-black">{siteData.title}</h1>
              <p className="text-gray-600 mb-6">{siteData.description}</p>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: siteData.content }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold tracking-tight">
              4site <span className="text-blue-500">PRO</span>
            </h1>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Transform GitHub Repositories<br />
              Into Professional Websites
            </h2>
            <p className="text-gray-400 text-lg">
              Instantly convert any GitHub repository into a stunning website with AI-powered analysis
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4 mb-16">
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Enter GitHub repository URL"
              className="w-full px-6 py-4 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isLoading}
            />
            
            <button
              onClick={handleGeneration}
              disabled={!repoUrl.trim() || isLoading}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Analyzing Repository...' : 'Generate Professional Website'}
            </button>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Enterprise Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-8">Enterprise-Grade Repository Intelligence</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                <h4 className="font-semibold mb-2 text-white">Deep Analysis</h4>
                <p className="text-gray-400 text-sm">
                  Complete codebase understanding with dependency mapping and architecture insights
                </p>
              </div>
              
              <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                <h4 className="font-semibold mb-2 text-white">Smart Content</h4>
                <p className="text-gray-400 text-sm">
                  AI-generated documentation that captures your project's true value proposition
                </p>
              </div>
              
              <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                <h4 className="font-semibold mb-2 text-white">Pro Design</h4>
                <p className="text-gray-400 text-sm">
                  Professional templates with responsive layouts and modern visual aesthetics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 text-center text-gray-500 text-sm">
        Powered by aegntic.ai
      </div>
    </div>
  );
};

export default App;