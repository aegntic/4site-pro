/**
 * GitIngest Enhancement for GeminiService
 * Drop-in enhancement that can be integrated into existing geminiService.ts
 */

import { GitIngestService } from './gitIngestService';

// Add this to your existing geminiService.ts to enhance repository analysis
export async function enhancePromptWithGitIngest(
  repoUrl: string,
  readmeContent: string,
  existingRepoData: any
): Promise<string> {
  try {
    // Try to get enhanced data from GitIngest
    const gitIngestData = await GitIngestService.analyzeRepository(repoUrl);
    
    // Build enhanced prompt with full repository context
    return `Perform DEEP repository analysis using comprehensive codebase data:

REPOSITORY OVERVIEW:
- Repository: ${existingRepoData.owner}/${existingRepoData.repo}
- URL: ${repoUrl}
- Total Files: ${gitIngestData.summary.files_processed}
- Repository Size: ${(gitIngestData.summary.total_size / 1024 / 1024).toFixed(2)}MB

COMPLETE TECHNOLOGY ANALYSIS:
${Object.entries(gitIngestData.structure)
  .filter(([path]) => path.includes('package.json') || path.includes('requirements.txt') || path.includes('Cargo.toml'))
  .map(([path]) => `- ${path}: Indicates ${detectTechFromFile(path)}`)
  .join('\n')}

CODEBASE ARCHITECTURE:
${analyzeCodebaseStructure(gitIngestData.structure)}

KEY IMPLEMENTATION FILES:
${Object.keys(gitIngestData.contents)
  .filter(path => isKeyFile(path))
  .slice(0, 10)
  .map(path => `- ${path}: ${getFileDescription(path, gitIngestData.contents[path])}`)
  .join('\n')}

DETECTED FEATURES FROM CODE:
${extractFeaturesFromCode(gitIngestData.contents)}

README CONTENT:
${readmeContent}

ANALYSIS REQUIREMENTS:
1. **Architecture Deep Dive** - Analyze actual code structure, not just documentation
2. **Feature Implementation** - Identify features from code patterns, not just claims
3. **Technical Dependencies** - List actual dependencies and their purposes
4. **Code Quality Indicators** - Testing, documentation, build processes
5. **Integration Points** - APIs, databases, external services from actual code

Generate a website that showcases the ACTUAL implementation, not just documentation.`;

  } catch (error) {
    console.warn('GitIngest enhancement failed, using standard analysis');
    // Fall back to original prompt
    return buildStandardPrompt(readmeContent, existingRepoData);
  }
}

function detectTechFromFile(filepath: string): string {
  if (filepath.includes('package.json')) return 'Node.js/JavaScript project';
  if (filepath.includes('requirements.txt')) return 'Python project';
  if (filepath.includes('Cargo.toml')) return 'Rust project';
  if (filepath.includes('go.mod')) return 'Go project';
  if (filepath.includes('pom.xml')) return 'Java/Maven project';
  return 'Configuration file';
}

function analyzeCodebaseStructure(structure: any): string {
  const paths = Object.keys(structure);
  const analysis = [];
  
  // Detect common patterns
  if (paths.some(p => p.includes('src/components'))) {
    analysis.push('- Component-based frontend architecture detected');
  }
  if (paths.some(p => p.includes('api/') || p.includes('routes/'))) {
    analysis.push('- RESTful API structure identified');
  }
  if (paths.some(p => p.includes('tests/') || p.includes('__tests__'))) {
    analysis.push('- Comprehensive test suite present');
  }
  if (paths.some(p => p.includes('.github/workflows'))) {
    analysis.push('- CI/CD with GitHub Actions configured');
  }
  if (paths.some(p => p.includes('docker') || p.includes('Dockerfile'))) {
    analysis.push('- Containerized deployment ready');
  }
  
  return analysis.join('\n') || '- Standard project structure';
}

function isKeyFile(path: string): boolean {
  const keyPatterns = [
    'index', 'main', 'app', 'server',
    'config', 'routes', 'api',
    'README', 'package.json', 'requirements.txt'
  ];
  return keyPatterns.some(pattern => path.toLowerCase().includes(pattern.toLowerCase()));
}

function getFileDescription(path: string, content: string): string {
  const lines = content.split('\n').slice(0, 5);
  
  // Try to extract purpose from comments
  const commentLine = lines.find(line => 
    line.includes('//') || line.includes('#') || line.includes('/*') || line.includes('"""')
  );
  
  if (commentLine) {
    return commentLine.replace(/^[\s\/*#"]+/, '').trim();
  }
  
  // Default descriptions based on file type
  if (path.includes('index')) return 'Entry point';
  if (path.includes('config')) return 'Configuration';
  if (path.includes('route')) return 'API routes';
  if (path.includes('component')) return 'UI component';
  
  return 'Implementation file';
}

function extractFeaturesFromCode(contents: Record<string, string>): string {
  const features = new Set<string>();
  
  // Scan all files for feature indicators
  Object.entries(contents).forEach(([path, content]) => {
    const lowerContent = content.toLowerCase();
    
    // Authentication
    if (lowerContent.includes('jwt') || lowerContent.includes('auth') || lowerContent.includes('login')) {
      features.add('- User authentication system');
    }
    
    // Database
    if (lowerContent.includes('mongoose') || lowerContent.includes('sequelize') || lowerContent.includes('prisma')) {
      features.add('- Database integration with ORM');
    }
    
    // API
    if (lowerContent.includes('swagger') || lowerContent.includes('openapi')) {
      features.add('- API documentation');
    }
    
    // Testing
    if (lowerContent.includes('describe(') || lowerContent.includes('test(') || lowerContent.includes('it(')) {
      features.add('- Automated testing');
    }
    
    // Real-time
    if (lowerContent.includes('socket.io') || lowerContent.includes('websocket')) {
      features.add('- Real-time communication');
    }
    
    // Caching
    if (lowerContent.includes('redis') || lowerContent.includes('memcached')) {
      features.add('- Caching layer');
    }
  });
  
  return Array.from(features).join('\n') || '- Standard features detected';
}

function buildStandardPrompt(readmeContent: string, repoData: any): string {
  // Fallback to original prompt structure
  return `Analyze this GitHub repository and generate a professional website...`;
}

// Integration example:
/*
// In your existing geminiService.ts, update the prompt generation:

import { enhancePromptWithGitIngest } from './gitIngestEnhancement';

// Replace your existing prompt with:
const enhancedPrompt = await enhancePromptWithGitIngest(
  repoUrl,
  readmeContent,
  repoData
);

// Use enhancedPrompt in your AI call
*/