
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL_NAME, GEMINI_API_TIMEOUT_MS } from '../constants';

// Get API key from Vite environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Gemini API Key not found. Please set the VITE_GEMINI_API_KEY environment variable.");
  throw new Error("Gemini API Key not configured");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generateContentWithTimeout = async (prompt: string): Promise<string> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Gemini API request timed out after ${GEMINI_API_TIMEOUT_MS / 1000} seconds.`)), GEMINI_API_TIMEOUT_MS);
  });

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
    
    const resultPromise = (async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }
      return text;
    })();
    
    // Race between the API call and timeout
    const text = await Promise.race([resultPromise, timeoutPromise]);
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      // Check for specific API errors
      if (error.message.includes('API key not valid')) {
        throw new Error(`Gemini API error: Invalid API key. Please check your VITE_GEMINI_API_KEY in .env.local`);
      }
      if (error.message.includes('status: 400')) {
        throw new Error(`Gemini API error: ${error.message}. The AI model might be unavailable or the repository URL might be inaccessible. Please try again or use a different URL.`);
      }
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error(`Gemini API error: ${String(error)}`);
  }
};


export const generateSiteContentFromUrl = async (repoUrl: string): Promise<string> => {
  const prompt = `
    You are an expert technical writer and AI assistant tasked with generating a professional project summary page content from a GitHub repository URL.
    The output MUST be clean, well-structured Markdown.

    GitHub Repository URL: ${repoUrl}

    Based on the repository URL, please generate Markdown content for a project presentation page.
    Infer the project's purpose, key features, and technology stack from common patterns in repository names, descriptions if available publicly, or typical project structures.
    If the repository URL seems invalid or does not provide enough clues, generate a generic but plausible project structure.

    The Markdown should be organized with clear headings (## for main sections, ### for subsections if necessary).
    Include the following sections if possible:

    1.  **Project Title**: Create a suitable H1 (#) title for the project based on the repo name. This should be the VERY FIRST line.
    2.  **Overview**: A concise paragraph (2-3 sentences) describing the project.
    3.  **Key Features**: A bulleted list of 3-5 notable features.
    4.  **Technology Stack**: A bulleted list of main technologies, languages, or frameworks used.
    5.  **Getting Started / Quick Demo**: A small code block (e.g., \`\`\`bash ... \`\`\`) with example commands for installation or basic usage, or a brief explanation.
    6.  **(Optional) Live Demo/Link**: If a live demo URL can be commonly inferred (e.g. for GitHub Pages), include it. Otherwise, omit or use a placeholder like "[Link to Live Demo (if available)]".

    Formatting Guidelines:
    - Use Markdown H1 (#) for the main project title only, as the first line.
    - Use Markdown H2 (##) for main section titles like "Overview", "Key Features", etc.
    - Use Markdown H3 (###) for sub-section titles if needed.
    - Use bullet points (-) for lists.
    - Use triple backticks (\`\`\`) for code blocks, specifying the language if known (e.g., \`\`\`bash).
    - Make the content engaging and suitable for a project showcase.
    - DO NOT include any preamble or explanation about your process, just the Markdown output.
    - Ensure the output is valid Markdown.
    - If the repo seems like a fork or very minimal, focus on what can be plausibly presented.

    Example of desired start:
    # My Awesome Project Title

    ## Overview
    This project is designed to...

    ## Key Features
    - Feature A
    - ...
  `;

  try {
    const markdownContent = await generateContentWithTimeout(prompt);
    if (!markdownContent || markdownContent.trim() === "") {
        throw new Error("Received empty or invalid Markdown content from AI.");
    }
    return markdownContent.trim();
  } catch (error) {
    console.error('Error generating site content from URL:', error);
    // Re-throw to be caught by the UI layer
    throw error;
  }
};
