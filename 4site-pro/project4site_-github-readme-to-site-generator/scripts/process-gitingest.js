#!/usr/bin/env node

/**
 * Process GitIngest output for enhanced repository analysis
 * This script reads GitIngest output and converts it to our SiteData format
 */

const fs = require('fs');
const path = require('path');

// Read from stdin (piped from gitingest CLI)
let inputData = '';

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    processGitIngestData(inputData);
  } catch (error) {
    console.error('Error processing GitIngest data:', error);
    process.exit(1);
  }
});

function processGitIngestData(rawData) {
  // GitIngest output format:
  // 1. Summary section with repository metadata
  // 2. Directory structure
  // 3. File contents with delimiters
  
  const lines = rawData.split('\n');
  const result = {
    summary: {},
    structure: {},
    contents: {},
    insights: {}
  };
  
  let currentSection = 'summary';
  let currentFile = null;
  let fileContent = [];
  
  for (const line of lines) {
    // Detect section changes
    if (line.includes('Directory structure:')) {
      currentSection = 'structure';
      continue;
    }
    if (line.includes('Files content:')) {
      currentSection = 'contents';
      continue;
    }
    
    // Process based on current section
    switch (currentSection) {
      case 'summary':
        if (line.includes('Repository:')) {
          result.summary.repository = line.split(':')[1].trim();
        }
        if (line.includes('Files:')) {
          result.summary.fileCount = parseInt(line.split(':')[1].trim());
        }
        break;
        
      case 'structure':
        if (line.trim() && !line.startsWith('│') && !line.startsWith('├') && !line.startsWith('└')) {
          // Parse directory structure
          const indent = line.search(/\S/);
          const name = line.trim();
          result.structure[name] = { depth: indent / 2 };
        }
        break;
        
      case 'contents':
        // Detect file delimiters
        if (line.startsWith('--- File:')) {
          // Save previous file if exists
          if (currentFile) {
            result.contents[currentFile] = fileContent.join('\n');
          }
          currentFile = line.replace('--- File:', '').trim();
          fileContent = [];
        } else if (currentFile) {
          fileContent.push(line);
        }
        break;
    }
  }
  
  // Save last file
  if (currentFile) {
    result.contents[currentFile] = fileContent.join('\n');
  }
  
  // Generate insights
  result.insights = generateInsights(result);
  
  // Output enhanced data
  console.log(JSON.stringify(result, null, 2));
  
  // Optionally save to file
  const outputPath = path.join(process.cwd(), '.gitingest-cache.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.error(`\nSaved analysis to: ${outputPath}`);
}

function generateInsights(data) {
  const insights = {
    techStack: [],
    features: [],
    architecture: '',
    dependencies: []
  };
  
  // Analyze package.json if present
  if (data.contents['package.json']) {
    try {
      const pkg = JSON.parse(data.contents['package.json']);
      insights.dependencies = Object.keys(pkg.dependencies || {});
      
      // Detect tech stack from dependencies
      if (insights.dependencies.includes('react')) insights.techStack.push('React');
      if (insights.dependencies.includes('vue')) insights.techStack.push('Vue');
      if (insights.dependencies.includes('express')) insights.techStack.push('Express.js');
      if (insights.dependencies.includes('next')) insights.techStack.push('Next.js');
    } catch (e) {}
  }
  
  // Analyze file structure
  const files = Object.keys(data.structure);
  if (files.some(f => f.includes('components'))) insights.features.push('Component-based architecture');
  if (files.some(f => f.includes('api') || f.includes('server'))) insights.features.push('API endpoints');
  if (files.some(f => f.includes('test') || f.includes('spec'))) insights.features.push('Test suite');
  if (files.some(f => f.includes('docker'))) insights.features.push('Docker support');
  
  // Determine architecture
  const hasBackend = files.some(f => f.includes('server') || f.includes('backend'));
  const hasFrontend = files.some(f => f.includes('client') || f.includes('frontend'));
  
  if (hasBackend && hasFrontend) {
    insights.architecture = 'Full-stack application';
  } else if (hasBackend) {
    insights.architecture = 'Backend service';
  } else if (hasFrontend) {
    insights.architecture = 'Frontend application';
  } else {
    insights.architecture = 'Library or utility';
  }
  
  return insights;
}

// Handle no input
if (process.stdin.isTTY) {
  console.log('Usage: gitingest <repo-url> | npm run process-repo');
  console.log('   or: npm run process-repo < gitingest-output.txt');
  process.exit(0);
}