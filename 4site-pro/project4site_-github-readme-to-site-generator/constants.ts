
// AI Models - Updated June 2025
export const AI_MODELS = {
  FREE: ['deepseek-r1.1', 'claude-4', 'gpt-5', 'gemma-3'],
  PRO: ['premium-ensemble'],
  BUSINESS: ['team-optimized-ensemble'],
  ENTERPRISE: ['custom-trained-models']
};

export const GENERATION_TIMES = {
  FREE: '2 minutes',
  PRO: '30 seconds', 
  BUSINESS: 'ultra-fast',
  ENTERPRISE: '9 seconds'
};

export const GEMINI_MODEL_NAME = "gemini-1.5-flash"; // Legacy fallback
export const GEMINI_API_TIMEOUT_MS = 30000;

export const DEFAULT_PROJECT_TITLE = "Living Website That Updates Itself";
export const DEFAULT_PROJECT_DESCRIPTION = "Automated content creation at development checkpoints - focus on building, we handle the marketing noise.";

export const MADE_WITH_PROJECT4SITE_TEXT = "Living website powered by 4site.pro";
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
// Pricing Tiers - June 2025
export const PRICING_TIERS = {
  FREE: {
    price: 0,
    websites: 5,
    generationTime: '2 minutes',
    features: ['Auto-updating websites', 'Automated blog posts', 'No ads - elegant featuring']
  },
  PRO: {
    price: 49.49,
    websites: 111,
    generationTime: '30 seconds',
    features: ['Network visibility', 'Professional recognition', '+11 gift websites', 'Remove attribution']
  },
  BUSINESS: {
    price: 494.94,
    websites: 'Team collaboration',
    generationTime: 'Ultra-fast',
    features: ['5-10 users', 'Advanced integrations', 'White-label ready', 'Priority support']
  },
  ENTERPRISE: {
    price: 4949.49,
    websites: 'Unlimited',
    generationTime: '9 seconds',
    features: ['Custom AI training', 'On-premise deployment', 'SLA guarantees', 'Dedicated manager']
  }
};

export const VALUE_PROPOSITIONS = {
  CORE: 'Living websites that automatically update themselves and create blog posts at development checkpoints',
  FOCUS: 'Get online instantly while learning to build digitally - focus on building, we handle the marketing noise',
  NETWORK: 'Professional recognition and visibility among curated industry leaders (not financial promises)',
  PHILOSOPHY: 'Complement not complicate - enhance existing workflows without adding complexity'
};

export const PROJECT_4SITE_BRANDING = {
  name: "4site.pro",
  tagline: "Living Websites That Update Themselves",
  subtitle: "Powered by aegntic ecosystems",
  copyright: `© ${new Date().getFullYear()} 4site.pro. All rights reserved.`,
  credits: "Ruthlessly developed by aeltd - powered by aegntic ecosystems",
  philosophy: "Complement not complicate"
};

