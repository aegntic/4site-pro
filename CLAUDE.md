# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**project4site** (aka **p4s** or **"project foresight"**) is an AI-powered presentation intelligence platform that transforms GitHub repositories into professional multimedia experiences. The platform automatically generates landing pages, videos, slideshows, and community hubs from markdown files (README.md, PLANNING.md, TASKS.md).

### Project Status
- **Current Stage**: MVP implementation in `4site-pro/project4site_-github-readme-to-site-generator/`
- **Development Status**: Functional prototype with AI-powered site generation
- **Future Vision**: Full microservices platform with video generation, commission tracking, and enterprise features

## Technology Stack

### Current MVP Stack
- **Frontend**: React 19.1.0, Vite 6.2.0, Framer Motion 12.16.0
- **AI Integration**: @google/genai 1.4.0 (Google Gemini API)
- **Styling**: Component-based inline styles (no CSS framework)
- **Markdown Processing**: marked 15.0.12
- **Icons**: lucide-react 0.513.0
- **Type System**: TypeScript 5.7.2

### Planned Full Platform Stack
- **Frontend**: Next.js 15, TailwindCSS, React 18
- **Backend**: Fastify 5 (TypeScript), FastAPI (Python)
- **Database**: PostgreSQL with Drizzle ORM, Redis, Neo4j
- **AI Models**: DeepSeek R1.1, Gemma 3, Anthropic Claude, OpenAI
- **Infrastructure**: Docker, Kubernetes, n8n workflows
- **Deployment**: Vercel, Railway, GitHub Actions

## Development Commands

### Current MVP (ACTIVE DEVELOPMENT)
```bash
# Navigate to the actual implementation
cd 4site-pro/project4site_-github-readme-to-site-generator/

# Install dependencies
npm install                   # Using npm (Vite project)

# Development
npm run dev                   # Start dev server (http://localhost:5173)
npm run build                # Build for production
npm run preview              # Preview production build

# Environment setup (REQUIRED)
echo "GEMINI_API_KEY=your_actual_api_key" > .env.local
```

### Root Project Commands (PLANNED - NOT FUNCTIONAL)
```bash
# These are defined in root package.json but not yet implemented
bun run dev                   # Will run all services
bun run dev:app              # Next.js frontend
bun run dev:api              # API server
bun run dev:github-app       # GitHub webhook server
bun run db:migrate           # Database migrations
bun run test                 # Run tests
bun run lint                 # ESLint
bun run type-check           # TypeScript checking
```

## Architecture Overview

### Current Implementation Structure
```
project4site/
├── 4site-pro/
│   ├── project4site_-github-readme-to-site-generator/  # ACTIVE MVP
│   │   ├── App.tsx                    # Main React application
│   │   ├── index.tsx                  # Entry point
│   │   ├── components/
│   │   │   ├── generator/             # Site generation UI
│   │   │   │   ├── LoadingIndicator.tsx
│   │   │   │   ├── SitePreview.tsx
│   │   │   │   └── URLInputForm.tsx
│   │   │   ├── landing/               # Landing page sections
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   ├── DemoSection.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── templates/             # Site templates
│   │   │   │   ├── CreativeProjectTemplate.tsx
│   │   │   │   └── TechProjectTemplate.tsx
│   │   │   └── ui/                    # Reusable components
│   │   │       ├── Alert.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Icon.tsx
│   │   │       └── Input.tsx
│   │   ├── services/
│   │   │   ├── geminiService.ts       # AI content generation
│   │   │   └── markdownParser.ts      # README parsing
│   │   ├── constants.ts               # App configuration
│   │   ├── types.ts                   # TypeScript definitions
│   │   ├── vite.config.ts             # Vite configuration
│   │   └── package.json               # Dependencies
│   └── n8n/                           # Automation workflows
│       ├── content_publishing_automation.json
│       ├── master_content_orchestrator.json
│       ├── performance_analytics_optimization.json
│       └── strategic_social_engagement.json
└── services/                          # Future microservices (stubs only)
    ├── ai-analysis-pipeline/          # Rust AI processing
    ├── api-gateway/                   # Request routing
    ├── commission-service/            # Partner tracking
    ├── deployment-service/            # Auto-deployment
    ├── github-app-service/            # Webhook processing
    └── site-generation-engine/        # Next.js app
```

## Key Implementation Details

### Site Generation Flow
1. User inputs GitHub repository URL
2. `URLInputForm` validates and submits URL
3. `geminiService.ts` fetches README content via GitHub API
4. Gemini AI analyzes content and generates site structure
5. Template selection based on project type (tech/creative)
6. `SitePreview` renders the generated site
7. User can deploy or customize further

### AI Integration Pattern
```typescript
// From services/geminiService.ts
import { GoogleGenerativeAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY || 'PLACEHOLDER_API_KEY';
const GEMINI_MODEL_NAME = 'gemini-2.0-flash-exp';
const GEMINI_API_TIMEOUT_MS = 30000;

export const analyzeRepository = async (readmeContent: string): Promise<SiteData> => {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
  
  // Structured prompt for consistent output
  const prompt = `Analyze this GitHub repository README...`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return parseGeminiResponse(response.text());
};
```

### Environment Variables

#### Required for MVP
```bash
# Only one environment variable needed
GEMINI_API_KEY=your_actual_api_key    # Google Gemini API access

# Set in .env.local for Vite (NOT .env)
# Access via: import.meta.env.GEMINI_API_KEY
```

#### Future Environment Variables
```bash
# These will be needed for full platform
GITHUB_TOKEN=github_pat_xxx           # GitHub API enhanced access
ANTHROPIC_API_KEY=sk-ant-xxx          # Claude API
OPENAI_API_KEY=sk-xxx                 # OpenAI API
DATABASE_URL=postgresql://xxx         # PostgreSQL
REDIS_URL=redis://localhost:6379      # Caching
VERCEL_TOKEN=xxx                      # Deployment
STRIPE_SECRET_KEY=sk_xxx              # Payments
```

## Development Patterns

### Component Structure
- **Feature-based organization**: Components grouped by functionality
- **Template system**: Pluggable templates for different project types
- **Prop drilling minimized**: Direct prop passing in small component trees
- **No global state management**: Local state with useState hooks

### TypeScript Patterns
```typescript
// From types.ts
export interface SiteData {
  title: string;
  description: string;
  features: string[];
  techStack: string[];
  sections: Section[];
  projectType: 'tech' | 'creative' | 'business';
  primaryColor: string;
  githubUrl: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  type: 'overview' | 'features' | 'installation' | 'usage' | 'custom';
}
```

### Error Handling
- API timeouts with AbortController
- Graceful fallbacks for AI failures
- User-friendly error messages
- Console logging for debugging

## Common Tasks

### Running the MVP
```bash
cd 4site-pro/project4site_-github-readme-to-site-generator/
npm install
npm run dev
# Open http://localhost:5173
```

### Adding a New Template
1. Create component in `components/templates/NewTemplate.tsx`
2. Import in `App.tsx`
3. Add logic in `renderTemplate()` function
4. Update `projectType` union in `types.ts`

### Testing AI Integration
```bash
# Set test API key
echo "GEMINI_API_KEY=your_test_key" > .env.local

# Run development server
npm run dev

# Test with various GitHub repos
# Example: https://github.com/facebook/react
```

### Debugging Gemini API
- Check API key in `.env.local` (not `.env`)
- Verify model name: `gemini-2.0-flash-exp`
- Monitor rate limits (current timeout: 30s)
- Check console for detailed error messages

## Troubleshooting

### Common Issues

1. **"PLACEHOLDER_API_KEY" Error**
   - Ensure `.env.local` exists with valid GEMINI_API_KEY
   - Restart dev server after adding env variable

2. **Vite Environment Variables**
   - Use `import.meta.env` not `process.env`
   - Only `VITE_` prefixed vars are exposed to client
   - GEMINI_API_KEY works because it's used server-side

3. **Module Not Found Errors**
   - Run `npm install` in the correct directory
   - Check you're in `4site-pro/project4site_-github-readme-to-site-generator/`

4. **TypeScript Errors**
   - No `tsconfig.json` in MVP (uses Vite defaults)
   - Run `tsc --noEmit` to check types

## Performance Considerations

### Current Targets
- Site generation: < 30 seconds
- AI processing: < 10 seconds
- Initial page load: < 3 seconds
- Bundle size: < 500KB

### Optimization Strategies
- Lazy load templates with React.lazy()
- Memoize expensive computations
- Cache AI responses (planned)
- Minimize bundle with tree shaking

## Security Considerations

### API Key Management
- Never commit API keys
- Use environment variables
- Implement server-side proxy (planned)
- Rate limit API calls

### Content Security
- Sanitize markdown input
- Validate GitHub URLs
- Escape HTML in templates
- CORS headers for API

## Future Development Roadmap

### Phase 1: MVP Enhancement (Current)
- ✅ Basic site generation
- ✅ AI content analysis
- ✅ Template system
- 🔄 Mobile optimization
- 📅 Analytics integration
- 📅 More templates

### Phase 2: Full Platform
- 📅 GitHub App integration
- 📅 Video generation
- 📅 Commission tracking
- 📅 User authentication
- 📅 Database persistence
- 📅 Deployment automation

### Phase 3: Enterprise
- 📅 Multi-model AI support
- 📅 White-label options
- 📅 Advanced customization
- 📅 Team collaboration
- 📅 API marketplace
- 📅 SLA guarantees

## Integration with ae-co-system

This project is part of the larger ae-co-system and shares:
- Runtime priorities (bun/npm, uv, cargo)
- AI model strategies (Gemini, DeepSeek, Claude)
- Privacy-first architecture
- Modular design patterns

Future integrations:
- aegnt-27 for AI authenticity
- DailyDoco Pro for documentation
- AegntiX for orchestration
- Quick Data MCP for analytics

## Quick Reference

### Key Files
- Entry: `4site-pro/project4site_-github-readme-to-site-generator/index.tsx`
- Main App: `4site-pro/project4site_-github-readme-to-site-generator/App.tsx`
- AI Service: `4site-pro/project4site_-github-readme-to-site-generator/services/geminiService.ts`
- Templates: `4site-pro/project4site_-github-readme-to-site-generator/components/templates/`

### Constants
```typescript
// From constants.ts
export const SITE_TITLE = 'project4site';
export const SITE_TAGLINE = 'Transform GitHub Repos into Professional Sites in 30 Seconds';
export const GEMINI_MODEL_NAME = 'gemini-2.0-flash-exp';
export const GEMINI_API_TIMEOUT_MS = 30000;
export const GITHUB_API_BASE = 'https://api.github.com';
```

### NPM Scripts (MVP)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

This guide reflects the actual current state of the project, distinguishing clearly between what's implemented (MVP) and what's planned (full platform).