# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **ProjectPresence** - an AI-powered presentation intelligence platform that transforms GitHub repositories into professional multimedia experiences. ProjectPresence automatically generates landing pages, videos, slideshows, and community hubs from just three markdown files: README.md, PLANNING.md, and TASKS.md.

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
- **Languages**: Rust, TypeScript, Python 3.12+
- **Runtimes**: Bun (preferred), Node.js (legacy only)
- **Databases**: PostgreSQL, Neo4j, Redis, SQLite
- **Containerization**: Docker Compose with multi-service orchestration
- **AI Models**: DeepSeek R1.1, Gemma 3, Flux.1, Claude 4

## Architecture Patterns

### The Disler Patterns (MANDATORY)
Every project follows systematic organizational patterns:
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

## Project Architecture

ProjectPresence consists of several key components:
- **GitHub App:** Webhook processing and repository integration (TypeScript/Bun)
- **AI Processing Pipeline:** Content analysis and design generation (Rust + TypeScript)
- **Site Generation Engine:** React component library for responsive sites
- **Video Generation:** AI-powered video and slideshow creation
- **Community Features:** Social integration and collaboration tools

## Development Commands

### Setup & Installation
```bash
# Install dependencies
bun install                    # Main application dependencies
uv sync                        # Python AI pipeline dependencies

# Setup development environment
cp .env.example .env           # Configure environment variables
bun run setup                  # Initialize database and services
```

### Development
```bash
# Start development servers
bun run dev                    # Start all services in development mode
bun run dev:app               # Frontend application only
bun run dev:api               # Backend API only
bun run dev:github-app        # GitHub App webhook processing

# AI Pipeline Development
uv run python scripts/ai_pipeline.py    # Test AI content analysis
uv run python scripts/video_gen.py      # Test video generation
```

### Testing & Quality
```bash
# Run tests
bun test                       # Frontend and API tests
cargo test                     # Rust AI pipeline tests
uv run pytest                 # Python AI components tests

# Code quality
bun run lint                   # ESLint + Prettier
bun run type-check            # TypeScript checking
cargo clippy                   # Rust linting
uv run ruff check             # Python linting
uv run mypy .                 # Python type checking
```

### Production & Deployment
```bash
# Build for production
bun run build                  # Build optimized application
cargo build --release         # Build Rust components
uv run python build_models.py # Prepare AI models

# Database operations
bun run db:migrate            # Run database migrations
bun run db:seed               # Seed development data
bun run db:reset              # Reset database (development only)
```

## Configuration

The project uses `.claude/settings.local.json` for Claude Code permissions and settings.

## Quality Standards

### Code Quality Commands (Once Established)
```bash
# Python projects
uv run ruff check --fix        # Linting with auto-fix
uv run mypy .                  # Type checking
uv run pytest                 # Testing

# TypeScript projects
bun run lint                   # ESLint
bun run type-check            # TypeScript checking
bun test                      # Testing

# Rust projects
cargo clippy -- -D warnings   # Linting
cargo test                    # Testing
cargo bench                   # Performance benchmarks
```

## Environment Variables

Environment variables will follow the ecosystem patterns:
```bash
# API Keys (optional for local development)
export OPENROUTER_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"

# Database URLs (when applicable)
export DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
export REDIS_URL="redis://localhost:6379"

# Development settings
export NODE_ENV="development"
export RUST_LOG="info"
export RUST_BACKTRACE="1"
```

## Integration with ae-co-system

This project can leverage shared components from the parent ecosystem:
- Shared libraries in `/home/tabs/ae-co-system/DAILYDOCO/libs/`
- Common infrastructure patterns
- MCP server integrations
- AI model access patterns

## Notes

- Always use `uv` for Python dependency management
- Always use `bun` for JavaScript/TypeScript dependency management
- Follow privacy-first design principles
- Implement modular, parallel-processing-ready architectures
- Use local-first processing by default