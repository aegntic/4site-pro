import { GoogleGenerativeAI } from '@google/generative-ai';
import { SiteData } from '../types';
import { EnhancedSiteContent } from '../enhanced-content-types';
import { convertToSiteData } from '../utils/contentConverter';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'PLACEHOLDER_API_KEY';
const GEMINI_MODEL_NAME = 'gemini-1.5-flash';
const GEMINI_API_TIMEOUT_MS = 30000;

async function generateEnhancedSiteContent(repoUrl: string): Promise<EnhancedSiteContent> {
  // Validate API key before proceeding
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PLACEHOLDER_API_KEY') {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
  
  // Extract repo info
  const urlParts = repoUrl.replace(/^https?:\/\/github\.com\//, '').split('/');
  const owner = urlParts[0];
  const repo = urlParts[1];
  
  // Fetch README content
  const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
  const response = await fetch(readmeUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.statusText}`);
  }
  
  const readmeData = await response.json();
  const readmeContent = atob(readmeData.content);
  
  const prompt = `Analyze this GitHub repository README and generate structured site content:

Repository: ${owner}/${repo}
README Content:
${readmeContent}

Please analyze this and provide a JSON response with:
{
  "metadata": {
    "title": "Project title",
    "description": "Brief description for hero section", 
    "projectType": "library|application|tool|framework|other",
    "primaryLanguage": "Main programming language",
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "techStack": ["Technology 1", "Technology 2"],
    "targetAudience": ["developers", "businesses", etc],
    "useCases": ["Use case 1", "Use case 2"],
    "primaryColor": "#hexcolor"
  },
  "markdown": "Enhanced markdown content for the site"
}

Focus on:
1. Extract key features and benefits
2. Identify technology stack
3. Create compelling description
4. Generate appropriate color based on the project
5. Ensure the content is engaging and informative

Respond with ONLY the JSON, no other text.`;

  const result = await model.generateContent(prompt);
  const response_text = await result.response.text();
  
  try {
    const parsed = JSON.parse(response_text);
    return {
      markdown: parsed.markdown,
      metadata: parsed.metadata,
      generatedAt: new Date(),
      aiModel: GEMINI_MODEL_NAME,
      confidence: 0.95
    };
  } catch (error) {
    console.error('Failed to parse AI response:', response_text);
    throw new Error('Invalid response from AI service');
  }
}

// Demo site data for when API key is not available
const generateDemoSiteData = (repoUrl: string): SiteData => {
  const urlParts = repoUrl.replace(/^https?:\/\/github\.com\//, '').split('/');
  const owner = urlParts[0];
  const repo = urlParts[1];
  
  return {
    title: `${repo} - Professional Landing Page`,
    description: `A modern, AI-generated landing page for the ${repo} project. Experience cutting-edge design with glass morphism effects and neural network animations.`,
    sections: [
      {
        id: 'hero',
        title: 'Hero Section',
        content: `# Welcome to ${repo}\n\nThis is a demo of what your generated site would look like with a professional AI analysis of your repository.`,
        type: 'overview'
      },
      {
        id: 'features',
        title: 'Key Features',
        content: '- Modern glass morphism design\n- Mobile-responsive layout\n- SEO optimized content\n- Professional typography',
        type: 'features'
      },
      {
        id: 'tech-stack',
        title: 'Technology Stack',
        content: 'Built with modern web technologies including React, TypeScript, and advanced CSS animations.',
        type: 'custom'
      }
    ],
    features: ['Modern Design', 'AI-Powered', 'Responsive Layout', 'Fast Loading'],
    techStack: ['React', 'TypeScript', 'CSS3', 'Vite'],
    projectType: 'tech' as const,
    primaryColor: '#6366f1',
    githubUrl: repoUrl,
    owner,
    repo,
    repoUrl,
    generatedAt: new Date(),
    aiModel: 'demo-mode',
    confidence: 0.85
  };
};

export const generateSiteContentFromUrl = async (repoUrl: string): Promise<SiteData> => {
  try {
    // Check if API key is available for real generation
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PLACEHOLDER_API_KEY' || GEMINI_API_KEY === 'DEMO_KEY_FOR_TESTING') {
      console.log('🎭 Demo mode: Generating sample site data...');
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateDemoSiteData(repoUrl);
    }
    
    const urlParts = repoUrl.replace(/^https?:\/\//, '').split('/');
    const owner = urlParts[1];
    const repo = urlParts[2];
    
    console.log(`Generating enhanced content for ${owner}/${repo}...`);
    const enhancedContent = await generateEnhancedSiteContent(repoUrl);
    const siteData = convertToSiteData(enhancedContent, repoUrl);
    
    siteData.owner = owner;
    siteData.repo = repo;
    siteData.repoUrl = repoUrl;
    
    return siteData;
  } catch (error) {
    console.log('⚠️ AI generation failed, falling back to demo mode...');
    return generateDemoSiteData(repoUrl);
  }
};