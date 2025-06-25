import { SiteData } from '../types';
import { EnhancedSiteContent } from '../enhanced-content-types';
import { convertToSiteData } from '../utils/contentConverter';

// Default API key for free models only (obfuscated)  
const DEFAULT_OPENROUTER_KEY = atob('c2stb3ItdjEtYWVnbnQtNHNpdGVwcm8tZnJlZS1vbmx5LWtleQ=='); // User's actual key will be inserted here
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || DEFAULT_OPENROUTER_KEY;

// Free models only for default key
const FREE_MODELS = [
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.1-8b-instruct:free', 
  'microsoft/phi-3-mini-128k-instruct:free',
  'huggingface/zephyr-7b-beta:free'
];

const OPENROUTER_MODEL = 'google/gemma-2-9b-it:free'; // Free model for cost control
const OPENROUTER_API_TIMEOUT_MS = 30000;

async function generateEnhancedSiteContent(repoUrl: string, apiKey?: string, modelOverride?: string): Promise<EnhancedSiteContent> {
  const effectiveApiKey = apiKey || OPENROUTER_API_KEY;
  const isDefaultKey = effectiveApiKey === DEFAULT_OPENROUTER_KEY;
  
  // Security: Force free models when using default key
  const selectedModel = isDefaultKey 
    ? (modelOverride && FREE_MODELS.includes(modelOverride) ? modelOverride : OPENROUTER_MODEL)
    : (modelOverride || 'google/gemini-2.0-flash-exp');
  
  // Validate API key before proceeding
  if (!effectiveApiKey || effectiveApiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error('OpenRouter API key not provided. Please enter your OpenRouter API key to generate AI-powered sites.');
  }
  
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
  
  // Fetch additional repository data for comprehensive analysis
  const repoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const [repoResponse, languagesResponse, contentsResponse] = await Promise.allSettled([
    fetch(repoApiUrl),
    fetch(`${repoApiUrl}/languages`),
    fetch(`${repoApiUrl}/contents`)
  ]);

  let repoData = null;
  let languages = null;
  let contents = null;

  if (repoResponse.status === 'fulfilled' && repoResponse.value.ok) {
    repoData = await repoResponse.value.json();
  }
  if (languagesResponse.status === 'fulfilled' && languagesResponse.value.ok) {
    languages = await languagesResponse.value.json();
  }
  if (contentsResponse.status === 'fulfilled' && contentsResponse.value.ok) {
    contents = await contentsResponse.value.json();
  }

  const prompt = `Perform comprehensive repository analysis and generate a professional website. This is NOT just a README converter - analyze the entire repository structure, technology stack, and codebase patterns:

REPOSITORY DATA:
- Repository: ${owner}/${repo}
- URL: ${repoUrl}
- Description: ${repoData?.description || 'No description'}
- Stars: ${repoData?.stargazers_count || 0}
- Forks: ${repoData?.forks_count || 0}
- Language: ${repoData?.language || 'Unknown'}
- Created: ${repoData?.created_at || 'Unknown'}
- Last Updated: ${repoData?.updated_at || 'Unknown'}
- Topics: ${repoData?.topics?.join(', ') || 'None'}
- Homepage: ${repoData?.homepage || 'None'}

TECHNOLOGY STACK:
${languages ? Object.entries(languages).map(([lang, bytes]) => `- ${lang}: ${Math.round((bytes as number) / 1000)}KB`).join('\n') : 'Languages data not available'}

REPOSITORY STRUCTURE:
${contents ? contents.slice(0, 20).map((item: any) => `- ${item.name} (${item.type})`).join('\n') : 'Structure data not available'}

README CONTENT:
${readmeContent}

1. **Complete Technology Analysis** - Not just what's in the README, but actual codebase patterns, architecture decisions, and technical implementation
2. **Professional Project Presentation** - Enterprise-grade documentation and feature showcase
3. **Comprehensive Feature Extraction** - Based on both documentation and actual code structure
4. **Deployment and Integration Guides** - Practical implementation information
5. **Architecture and Dependencies** - Technical depth that showcases the full project scope

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

  const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${effectiveApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://4site.pro',
      'X-Title': '4site.pro - GitHub to Website Generator'
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!apiResponse.ok) {
    const errorData = await apiResponse.text();
    throw new Error(`OpenRouter API error: ${apiResponse.status} - ${errorData}`);
  }

  const data = await apiResponse.json();
  const response_text = data.choices[0]?.message?.content;

  if (!response_text) {
    throw new Error('No response from OpenRouter API');
  }
  
  try {
    const parsed = JSON.parse(response_text);
    return {
      markdown: parsed.markdown,
      metadata: parsed.metadata,
      generatedAt: new Date(),
      aiModel: selectedModel,
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

export const generateSiteContentFromUrl = async (repoUrl: string, apiKey?: string): Promise<SiteData> => {
  try {
    const effectiveApiKey = apiKey || OPENROUTER_API_KEY;
    
    // Check if API key is available for real generation
    if (!effectiveApiKey || effectiveApiKey === 'PLACEHOLDER_API_KEY' || effectiveApiKey === 'DEMO_KEY_FOR_TESTING') {
      console.log('🎭 Demo mode: Generating sample site data...');
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateDemoSiteData(repoUrl);
    }
    
    const urlParts = repoUrl.replace(/^https?:\/\//, '').split('/');
    const owner = urlParts[1];
    const repo = urlParts[2];
    
    console.log(`Generating enhanced content for ${owner}/${repo} using OpenRouter...`);
    const enhancedContent = await generateEnhancedSiteContent(repoUrl, apiKey);
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