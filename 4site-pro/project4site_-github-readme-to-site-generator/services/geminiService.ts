
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_NAME, GEMINI_API_TIMEOUT_MS } from '../constants';

// Ensure API_KEY is available in the environment.
// In a Vite/CRA app, this would be process.env.REACT_APP_API_KEY or process.env.VITE_API_KEY
// For this environment, we rely on a globally available process.env.API_KEY
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API Key not found. Please set the API_KEY environment variable.");
  // Potentially throw an error or handle this state in the UI
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Non-null assertion, assuming it's set for app to work

const generateContentWithTimeout = async (prompt: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_API_TIMEOUT_MS);

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      // config: { thinkingConfig: { thinkingBudget: 0 } } // Disable thinking for speed if needed
    });
    // The line below for signal is not directly supported by generateContent in this way.
    // AbortController is usually for fetch. For @google/genai, direct timeout is managed.
    // If the SDK supports AbortSignal in future, it could be passed in config.
    // For now, the timeout is a client-side race condition.
    
    clearTimeout(timeoutId);
    return response.text;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Gemini API request timed out after ${GEMINI_API_TIMEOUT_MS / 1000} seconds.`);
    }
    console.error("Error calling Gemini API:", error);
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
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
