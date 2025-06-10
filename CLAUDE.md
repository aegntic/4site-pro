# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **project4site** (ProjectPresence) - an AI-powered presentation intelligence platform that transforms GitHub repositories into professional multimedia experiences. The platform automatically generates landing pages, videos, slideshows, and community hubs from just three markdown files: README.md, PLANNING.md, and TASKS.md.

## Parent Ecosystem Context

This project is part of the larger ae-co-system located at `/home/tabs/ae-co-system/` which includes:
- DailyDoco Pro (automated documentation platform)
- aegnt-27 (Human Peak Protocol)
- AegntiX (AI orchestration platform)
- Aegntic MCP (dynamic MCP server generator)
- YouTube Intelligence Engine
- Quick Data MCP

## Technology Stack Priorities

### Runtime Priorities (CRITICAL)
1. **Python**: Use `uv` instead of pip/pip-tools/poetry for ALL Python package management (10-100x faster)
2. **JavaScript/TypeScript**: Use `bun` instead of npm/node for ALL JS/TS development (3x faster)
3. **Rust**: Use `cargo` for systems programming and performance-critical components

### Core Technologies
- **Languages**: TypeScript (primary), Rust (performance-critical), Python 3.12+ (AI pipeline)
- **Runtimes**: Bun (preferred), Node.js (legacy only)
- **Frameworks**: Next.js 14+, React 18+, Vite, Fastify
- **Styling**: TailwindCSS, Framer Motion
- **AI Integration**: OpenAI SDK, Anthropic SDK, Google Gemini API
- **Databases**: PostgreSQL (via Drizzle ORM), Redis (caching)
- **Deployment**: Vercel, GitHub Actions, Docker

## Project Structure

```
/home/tabs/ae-co-system/project4site/
├── src/                       # Main application source (when created)
│   ├── api/                   # Backend API server (Fastify)
│   ├── app/                   # Next.js app directory
│   ├── github-app/            # GitHub webhook processing
│   └── db/                    # Database models and migrations
├── 4site-pro/                 # Current implementation prototype
│   └── project4site_-github-readme-to-site-generator/
│       ├── components/        # React components
│       │   ├── generator/     # Site generation UI
│       │   ├── landing/       # Landing page components
│       │   ├── templates/     # Site templates
│       │   └── ui/            # Reusable UI components
│       ├── services/          # Business logic
│       │   ├── geminiService.ts    # AI content analysis
│       │   └── markdownParser.ts   # Markdown processing
│       └── App.tsx           # Main application entry
└── package.json              # Root package configuration
```

## Development Commands

### Main Project (Root Directory)
```bash
# Initial setup
bun install                    # Install all dependencies
bun run setup                  # Setup environment and database

# Development
bun run dev                    # Start all services concurrently
bun run dev:app               # Next.js frontend only
bun run dev:api               # Fastify API server only
bun run dev:github-app        # GitHub webhook server only

# Testing & Quality
bun test                      # Run all tests
bun test:watch               # Run tests in watch mode
bun run lint                  # ESLint checking
bun run lint:fix             # ESLint with auto-fix
bun run type-check           # TypeScript type checking
bun run format               # Prettier formatting
bun run format:check         # Check formatting

# Build & Production
bun run build                 # Build all components
bun run build:app            # Build Next.js app
bun run build:api            # Build API server
bun run start                # Start production server

# Database Management
bun run db:migrate           # Run database migrations
bun run db:seed              # Seed development data
bun run db:reset             # Reset database (development only)
```

### 4site-pro Prototype (Subdirectory)
```bash
# From 4site-pro/project4site_-github-readme-to-site-generator/
bun install                   # Install dependencies
bun run dev                   # Start Vite dev server (port 5173)
bun run build                # Build for production
bun run preview              # Preview production build
```

## Architecture Patterns

### The Disler Patterns (MANDATORY)
- `.claude/` directories for AI-enhanced development workflows
- `ai_docs/` for persistent AI memory and technical knowledge
- `specs/` for executable feature specifications
- `prompts/` for reusable prompt libraries
- Modular, parallel-processing-ready architectures

### Privacy-First Design
- **Local-First**: All processing happens locally by default
- **Granular Consent**: Project-level permissions management
- **Sensitive Content Detection**: Real-time API key/password filtering
- **Encryption**: AES-256 for all stored content

### Key Components

1. **GitHub App Integration**
   - Webhook processing for repository changes
   - Real-time updates when markdown files change
   - OAuth authentication flow

2. **AI Processing Pipeline**
   - Content analysis using Gemini/GPT-4/Claude
   - Design system selection based on content type
   - Video and slideshow generation pipeline

3. **Site Generation Engine**
   - Template selection based on project type
   - Responsive component library
   - Real-time preview system

4. **Developer Toolkit Orchestrator**
   - Service integration automation
   - Account provisioning across platforms
   - Environment setup automation

## Development Guidelines

### Code Style
- Use TypeScript strict mode for all new code
- Follow Airbnb ESLint configuration
- Use functional components with hooks in React
- Implement proper error boundaries and suspense

### Testing Strategy
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage target

### Performance Requirements
- Site generation: < 30 seconds
- Video creation: < 5 minutes
- Page load time: < 3 seconds
- API response time: < 200ms (p95)

## Environment Variables

Required environment variables (see .env.example):
```bash
# API Keys
OPENAI_API_KEY=              # OpenAI API for content analysis
ANTHROPIC_API_KEY=           # Claude API for advanced processing
GOOGLE_GEMINI_API_KEY=       # Gemini API for content generation

# Database
DATABASE_URL=                # PostgreSQL connection string
REDIS_URL=                   # Redis connection string

# GitHub App
GITHUB_APP_ID=               # GitHub App ID
GITHUB_APP_PRIVATE_KEY=      # GitHub App private key
GITHUB_WEBHOOK_SECRET=       # Webhook verification secret

# Services
SUPABASE_URL=                # Supabase project URL
SUPABASE_ANON_KEY=          # Supabase anonymous key
STRIPE_SECRET_KEY=           # Stripe API key
VERCEL_API_TOKEN=           # Vercel deployment token

# Development
NODE_ENV=development         # Environment mode
PORT=3000                    # Application port
API_PORT=3001               # API server port
```

## Integration Points

### With ae-co-system
- Can leverage aegnt-27 for AI authenticity scoring
- Integration with DailyDoco Pro for documentation generation
- Shared AI model access patterns
- Common MCP server infrastructure

### External Services
- GitHub API for repository access
- Vercel API for deployments
- Stripe for payment processing
- Supabase for user management
- Various design tool APIs (Figma, Canva, Adobe)

## Global Development Rules

### Rule 1: No Shortcuts or Simplification
Never simplify or take shortcuts. Always problem-solve through complexity rather than avoiding it. Building sophisticated solutions is always preferred over easy workarounds.

### Rule 2: Mandatory Human-Level Testing
Before providing any terminal command or allowing user access, validate functionality using automated testing tools (Puppeteer, Playwright, etc.). If issues are found, use advanced reasoning tools to resolve them completely.