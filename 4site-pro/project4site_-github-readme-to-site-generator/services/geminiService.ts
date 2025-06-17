import { GoogleGenerativeAI } from '@google/generative-ai';
import { SiteData } from '../types';
import { EnhancedSiteContent } from '../enhanced-content-types';
import { convertToSiteData } from '../utils/contentConverter';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'PLACEHOLDER_API_KEY';
const GEMINI_MODEL_NAME = 'gemini-1.5-flash';
const GEMINI_API_TIMEOUT_MS = 30000;

async function generateEnhancedSiteContent(repoUrl: string): Promise<EnhancedSiteContent> {
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

export const generateSiteContentFromUrl = async (repoUrl: string): Promise<SiteData> => {
  try {
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
    throw new Error(`Failed to generate content for ${repoUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};