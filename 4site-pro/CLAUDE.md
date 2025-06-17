# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**4site.pro** is an AI-powered platform that transforms GitHub repositories into professional, stunning websites in under 60 seconds. The project uses Google Gemini AI to analyze README files and generate complete landing pages with modern glass morphism UI design.

### Current Status
- **MVP Stage**: Functional React/Vite application in `project4site_-github-readme-to-site-generator/`
- **Technology**: React 19.1.0, Vite 6.2.0, TypeScript, Google Gemini AI
- **Design**: Glass morphism UI with neural network animations
- **Future Vision**: Full microservices platform with video generation and multi-model AI support

## Technology Stack

### Active MVP Implementation
- **Frontend Framework**: React 19.1.0 with TypeScript 5.7.2
- **Build Tool**: Vite 6.2.0
- **AI Integration**: Google Gemini API (gemini-1.5-flash model)
- **Animations**: Framer Motion 12.16.0
- **Icons**: Lucide React 0.513.0
- **Markdown**: marked 15.0.12, react-markdown 9.0.3
- **Styling**: Inline styles with glass morphism effects

### Planned Full Stack (Not Yet Implemented)
- **Frontend**: Next.js 15, TailwindCSS, React 19
- **Backend**: Rust (actix-web), Python (FastAPI), Node.js (Fastify)
- **Databases**: PostgreSQL, Redis, Neo4j
- **AI Models**: DeepSeek R1.1, Gemini, Claude, OpenAI
- **Infrastructure**: Docker, Kubernetes, GitHub Actions
- **Automation**: n8n workflows (already configured)

## Project Structure

```
4site-pro/
├── project4site_-github-readme-to-site-generator/  # ACTIVE MVP
│   ├── src/
│   │   ├── App.tsx                    # Main application component
│   │   ├── main.tsx                   # Entry point
│   │   ├── components/
│   │   │   ├── generator/             # Site generation UI
│   │   │   │   ├── GeneratorLayout.tsx
│   │   │   │   ├── LoadingIndicator.tsx
│   │   │   │   ├── SitePreview.tsx
│   │   │   │   └── URLInputForm.tsx
│   │   │   ├── landing/               # Landing page sections
│   │   │   │   ├── GlassHeroSection.tsx      # Main hero with neural bg
│   │   │   │   ├── GlassFeaturesSection.tsx  # Feature cards
│   │   │   │   ├── GlassDemoSection.tsx      # Live demo
│   │   │   │   └── GlassFooter.tsx
│   │   │   ├── templates/             # Site templates
│   │   │   │   ├── Tech4SiteTemplate.tsx
│   │   │   │   ├── CreativePortfolioTemplate.tsx
│   │   │   │   └── ProfessionalTemplate.tsx
│   │   │   └── ui/                    # Reusable components
│   │   │       ├── NeuralBackground.tsx      # WebGL neural network
│   │   │       ├── NeuralBranding.tsx        # 4SITE branding
│   │   │       └── GlassCard.tsx
│   │   ├── services/
│   │   │   ├── geminiService.ts       # AI analysis & generation
│   │   │   └── githubService.ts       # GitHub API integration
│   │   ├── styles/
│   │   │   └── glassmorphism.css      # Glass morphism styles
│   │   ├── types/                     # TypeScript definitions
│   │   └── utils/                     # Helper functions
│   ├── public/
│   │   └── ae4sitepro-assets/         # Branding assets
│   ├── index.html                     # Entry HTML
│   ├── package.json                   # Dependencies
│   ├── vite.config.ts                 # Vite configuration
│   └── tsconfig.json                  # TypeScript config
├── services/                          # Future microservices (stubs)
│   ├── ai-analysis-pipeline/          # Rust AI processor
│   ├── api-gateway/                   # Request routing
│   ├── commission-service/            # Partner tracking
│   ├── deployment-service/            # Auto-deployment
│   ├── github-app-service/            # Webhook handler
│   └── site-generation-engine/        # Next.js app
├── n8n/                               # Automation workflows
│   ├── content_publishing_automation.json
│   ├── master_content_orchestrator.json
│   ├── performance_analytics_optimization.json
│   └── strategic_social_engagement.json
├── ae4sitepro-assets/                 # UI component library
├── TASKS.md                           # Current development tasks
├── ULTRAPLAN.md                       # Strategic vision
└── package.json                       # Root package (future use)
```

## Development Commands

### Active MVP Development
```bash
# Navigate to implementation directory
cd project4site_-github-readme-to-site-generator/

# Install dependencies
npm install

# Start development server
npm run dev                    # Runs on http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check             # TypeScript validation

# Linting (if configured)
npm run lint
```

### Environment Setup
```bash
# Create .env.local file (required)
echo "VITE_GEMINI_API_KEY=your_actual_api_key" > .env.local

# Optional: GitHub token for enhanced API access
echo "VITE_GITHUB_TOKEN=your_github_token" >> .env.local
```

### Testing Commands
```bash
# Currently no test suite configured
# To add tests: npm install --save-dev vitest @testing-library/react
# Then: npm run test
```

## Key Features & Architecture

### Site Generation Flow
1. User inputs GitHub repository URL
2. System fetches README via GitHub API
3. Gemini AI analyzes content in two modes:
   - **Quick Mode** (15s): Basic analysis and template selection
   - **Deep Mode** (2-5min): Comprehensive analysis with advanced features
4. Template engine renders the generated site
5. User can preview and deploy

### AI Integration Architecture
```typescript
// services/geminiService.ts pattern
const analyzeRepository = async (readme: string, mode: 'quick' | 'deep') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = mode === 'quick' ? QUICK_ANALYSIS_PROMPT : DEEP_ANALYSIS_PROMPT;
  const result = await model.generateContent(prompt + readme);
  return parseAIResponse(result.response.text());
};
```

### Glass Morphism UI System
- Backdrop blur effects with semi-transparent backgrounds
- Neural network WebGL animation as background
- Smooth animations with Framer Motion
- Responsive design with mobile-first approach
- Custom glass cards and components

## Environment Variables

### Required
```bash
VITE_GEMINI_API_KEY=your_api_key      # Google Gemini API access
```

### Optional
```bash
VITE_GITHUB_TOKEN=github_pat_xxx       # Enhanced GitHub API access
VITE_API_TIMEOUT=30000                 # API timeout in ms
VITE_ENABLE_ANALYTICS=true             # Enable analytics
```

## Common Tasks

### Adding a New Template
1. Create template component in `src/components/templates/NewTemplate.tsx`
2. Import in `src/services/geminiService.ts`
3. Add to template selection logic
4. Update TypeScript types in `src/types/`

### Modifying AI Prompts
1. Edit prompts in `src/services/geminiService.ts`
2. Update `QUICK_ANALYSIS_PROMPT` or `DEEP_ANALYSIS_PROMPT`
3. Test with various repository types

### Customizing Glass Effects
1. Modify `src/styles/glassmorphism.css`
2. Adjust backdrop-filter and opacity values
3. Update color scheme variables

### Deploying the MVP
```bash
# Build production version
npm run build

# Deploy to Vercel (if configured)
vercel

# Or deploy dist/ folder to any static host
```

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Quick Generation | < 15s | ✓ |
| Deep Analysis | < 5min | ✓ |
| Page Load | < 3s | ✓ |
| Bundle Size | < 1MB | ~800KB |
| Lighthouse Score | > 90 | 85-90 |

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Verify `VITE_GEMINI_API_KEY` in `.env.local`
   - Ensure key has Gemini API access enabled
   - Check API quota limits

2. **GitHub Rate Limiting**
   - Add `VITE_GITHUB_TOKEN` for higher limits
   - Implement caching (planned feature)

3. **Build Failures**
   - Clear `node_modules` and reinstall
   - Check TypeScript errors: `npm run type-check`
   - Verify all imports resolve correctly

4. **Neural Background Performance**
   - Disable on low-end devices (automatic)
   - Reduce particle count in `NeuralBackground.tsx`
   - Use CSS fallback for older browsers

## Future Development Roadmap

### Phase 1: MVP Enhancement (Current)
- ✅ Basic site generation with AI
- ✅ Glass morphism UI
- ✅ Three template options
- 🔄 Performance optimizations
- 📅 More templates
- 📅 Export functionality

### Phase 2: Full Platform (Q2 2025)
- 📅 Microservices architecture
- 📅 Video generation from README
- 📅 Multi-model AI support
- 📅 User authentication
- 📅 Commission tracking
- 📅 GitHub App integration

### Phase 3: Enterprise (Q3 2025)
- 📅 White-label options
- 📅 API marketplace
- 📅 Team collaboration
- 📅 Advanced analytics
- 📅 Custom AI models
- 📅 SLA guarantees

## Integration Points

### n8n Workflows
- Content publishing automation ready
- Social media integration configured
- Analytics pipeline setup
- Webhook handlers defined

### Future Microservices
- AI pipeline: Rust for performance
- API gateway: Rate limiting and auth
- Commission service: Stripe integration
- Deployment: Vercel/Netlify APIs
- GitHub App: Webhook processing

## Best Practices

### Code Style
- Use TypeScript strict mode
- Prefer functional components
- Keep components under 200 lines
- Extract reusable logic to hooks
- Use proper error boundaries

### Performance
- Lazy load heavy components
- Optimize images with WebP
- Use React.memo for expensive renders
- Implement virtual scrolling for lists
- Cache AI responses locally

### Security
- Never expose API keys in client code
- Validate all user inputs
- Sanitize markdown content
- Use CORS properly
- Implement rate limiting

## Quick Reference

### Key Files
- Entry: `src/main.tsx`
- App: `src/App.tsx`
- AI Service: `src/services/geminiService.ts`
- Main Template: `src/components/templates/Tech4SiteTemplate.tsx`
- Neural Background: `src/components/ui/NeuralBackground.tsx`

### Important Constants
```typescript
// From geminiService.ts
const GEMINI_MODEL = 'gemini-1.5-flash';
const QUICK_TIMEOUT = 15000;  // 15 seconds
const DEEP_TIMEOUT = 300000;  // 5 minutes

// From App.tsx
const ANIMATION_DURATION = 0.5;
const GLASS_BLUR = 10;  // pixels
```

This project is part of the larger ae-co-system and will eventually integrate with DailyDoco Pro, aegnt-27, and other ecosystem services.