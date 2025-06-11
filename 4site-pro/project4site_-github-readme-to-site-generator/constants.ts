
export const GEMINI_MODEL_NAME = "gemini-1.5-flash";
export const GEMINI_API_TIMEOUT_MS = 30000; // 30 seconds

export const DEFAULT_PROJECT_TITLE = "My Awesome Project";
export const DEFAULT_PROJECT_DESCRIPTION = "A brief description of this amazing project.";

export const MADE_WITH_PROJECT4SITE_TEXT = "Made with Project 4site";
export const PROJECT4SITE_URL = "https://4site.pro";

export const SOCIAL_SHARE_PLATFORMS = [
  { name: "Twitter", icon: "Twitter", urlPrefix: "https://twitter.com/intent/tweet?url=" },
  { name: "LinkedIn", icon: "Linkedin", urlPrefix: "https://www.linkedin.com/shareArticle?mini=true&url=" },
  { name: "Facebook", icon: "Facebook", urlPrefix: "https://www.facebook.com/sharer/sharer.php?u=" },
  { name: "Copy Link", icon: "Link", urlPrefix: "" } // Special case for copy
];

export const MAX_DESCRIPTION_LENGTH = 200; // For summaries

export const GITHUB_URL_REGEX = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)(?:\/)?$/i;

// aegntic.ai and Project 4site branding
export const AEGNTIC_AI_URL = "https://aegntic.ai";
export const AEGNTIC_FOUNDATION_URL = "https://aegntic.foundation";
export const AEGNTIC_EMAIL = "enquiries@aegntic.ai";
export const PROJECT_4SITE_EMAIL = "project@4site.pro";
export const PROJECT_4SITE_BRANDING = {
  name: "Project 4site",
  tagline: "Powered by aegntic.ai",
  copyright: `© ${new Date().getFullYear()} Project 4site. All rights reserved.`,
  credits: "A Project 4site initiative powered by aegntic.ai technology"
};

