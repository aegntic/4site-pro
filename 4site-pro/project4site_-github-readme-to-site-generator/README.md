# Project 4site - GitHub Repository to Professional Website Generator | Powered by aegntic.ai

Transform any GitHub repository into a stunning, professional website powered by aegntic.ai technology with deep analysis and multi-page generation.

## ✨ Features

### Quick Generation Mode (15 seconds)
- **aegntic.ai-Generated Hero Visuals**: Beautiful, contextual hero images created by aegntic.ai and FLUX.1
- **Responsive Single-Page Site**: Optimized for all devices
- **SEO Optimized**: Built-in meta tags and structured data
- **Instant Preview**: See your site immediately

### Deep Analysis Mode (2-5 minutes) 🆕
- **Complete Repository Analysis**: Analyzes entire codebase, not just README
- **Architecture Diagrams**: Auto-generated Mermaid diagrams showing system structure
- **Multi-Page Documentation**: 5-10+ pages including API docs, examples, and guides
- **Code Insights & Metrics**: Quality scores, dependency analysis, and recommendations
- **Smart Content Prioritization**: aegntic.ai determines the most important features for hero page

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- A Gemini API key (required)
- A GitHub personal access token (optional, for deep analysis)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/project4site.git
cd project4site/4site-pro/project4site_-github-readme-to-site-generator

# Install dependencies (using Bun - recommended)
bun install

# Or using npm
npm install
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Add your API keys to `.env.local`:
```env
# Required for basic site generation
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional - for deep repository analysis
VITE_GITHUB_TOKEN=github_pat_your_token_here

# Optional - for enhanced visual generation
VITE_FAL_API_KEY=your_fal_api_key_here
```

### Running the App

```bash
# Using Bun (recommended - 3x faster)
bun run dev

# Or using npm
npm run dev
```

Open http://localhost:5173 in your browser.

## 📖 Usage

### Quick Generation
1. Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
2. Choose "Quick Generation" mode
3. Wait ~15 seconds for your site to be generated
4. Preview and deploy your site

### Deep Analysis
1. Enter a GitHub repository URL
2. Choose "Deep Analysis" mode
3. Watch the real-time progress as the system:
   - Analyzes repository structure and code
   - Generates AI insights
   - Creates architecture diagrams
   - Builds multi-page documentation
4. Explore your comprehensive documentation site

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 19, Vite, TailwindCSS, Framer Motion
- **AI Integration**: Google Gemini, FAL.ai for image generation
- **Analysis**: Custom TypeScript analyzers for multiple languages
- **Visualization**: Mermaid.js for architecture diagrams

### Key Components
- `repositoryAnalyzer.ts` - Deep code analysis engine
- `deepAnalysisOrchestrator.ts` - Coordinates the analysis pipeline
- `multiModalOrchestrator.ts` - Handles AI content and image generation
- `DeepSitePreview.tsx` - Multi-page preview component

## 🎨 Customization

### Templates
The system automatically selects the best template based on your project:
- **TechProjectTemplate**: For technical projects and libraries
- **CreativeProjectTemplate**: For design-focused projects
- **APIDocumentationTemplate**: For API-heavy projects
- **LibraryShowcaseTemplate**: For utility libraries

### Styling
All components use TailwindCSS with a custom Wu-Tang inspired color scheme:
- Primary: `#FFD700` (Wu-Tang Gold)
- Background: GitHub dark mode palette
- Accent colors based on technology stack

## 🔧 Development

### Project Structure
```
project4site_-github-readme-to-site-generator/
├── components/           # React components
│   ├── generator/       # Site generation UI
│   ├── landing/         # Landing page components
│   └── templates/       # Site templates
├── services/            # Business logic
│   ├── repositoryAnalyzer.ts      # Code analysis
│   ├── deepAnalysisOrchestrator.ts # Deep analysis pipeline
│   └── geminiService.ts           # AI integration
├── types.ts             # TypeScript definitions
└── App.tsx              # Main application
```

### Adding New Features

#### New Analysis Capabilities
1. Extend `repositoryAnalyzer.ts` with new analysis methods
2. Update `DeepAnalysisResult` interface in the same file
3. Integrate into `deepAnalysisOrchestrator.ts` pipeline

#### New Page Types
1. Add page generation logic to `deepAnalysisOrchestrator.ts`
2. Update `PageContent` interface
3. Add navigation entries in `createNavigationStructure()`

## 📊 Performance

- **Quick Mode**: ~15 seconds for single-page generation
- **Deep Mode**: 2-5 minutes depending on repository size
- **Memory Usage**: Optimized for repositories up to 10,000 files
- **Concurrent Processing**: Leverages parallel API calls

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Google Gemini for AI-powered content generation
- FAL.ai for image generation
- Mermaid.js for diagram rendering
- The open source community

---

Built with ❤️ by the Project4Site team