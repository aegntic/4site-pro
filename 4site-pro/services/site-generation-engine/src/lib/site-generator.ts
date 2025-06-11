import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { marked } from 'marked';
import path from 'path';
import fs from 'fs/promises';

// Import template components
import { ModernWebTemplate } from '../templates/ModernWebTemplate';
import { DeveloperLibraryTemplate } from '../templates/DeveloperLibraryTemplate';
import { TechnicalShowcaseTemplate } from '../templates/TechnicalShowcaseTemplate';
import { CreativeProjectTemplate } from '../templates/CreativeProjectTemplate';
import { StartupProductTemplate } from '../templates/StartupProductTemplate';
import { MinimalPortfolioTemplate } from '../templates/MinimalPortfolioTemplate';

export interface SiteGenerationConfig {
  siteId: string;
  siteName: string;
  siteDescription: string | null;
  templateType: string;
  analysisResult: AnalysisResult;
  customizations: any;
  features: SiteFeatures;
}

export interface AnalysisResult {
  project_type: string;
  complexity_score: number;
  recommended_template: string;
  key_features: string[];
  tech_stack: string[];
  partner_recommendations: PartnerRecommendation[];
  content_sections: ContentSection[];
  seo_keywords: string[];
}

export interface PartnerRecommendation {
  partner_id: string;
  partner_name: string;
  relevance_score: number;
  integration_type: string;
  cta_text: string;
  placement_priority: number;
}

export interface ContentSection {
  section_type: string;
  title: string;
  content: string;
  priority: number;
  media_suggestions: MediaSuggestion[];
}

export interface MediaSuggestion {
  media_type: string;
  description: string;
  placement: string;
}

export interface SiteFeatures {
  includeDemo: boolean;
  enableVideo: boolean;
  enableSlideshow: boolean;
}

export interface GeneratedSiteData {
  html: string;
  css: string;
  js: string;
  assets: SiteAsset[];
  metadata: SiteMetadata;
  pages: GeneratedPage[];
}

export interface SiteAsset {
  type: 'image' | 'video' | 'document' | 'style' | 'script';
  path: string;
  content?: Buffer | string;
  url?: string;
  size?: number;
}

export interface SiteMetadata {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  generator: string;
  viewport: string;
  canonical?: string;
  openGraph: OpenGraphData;
  twitter: TwitterCardData;
  jsonLd: any;
}

export interface OpenGraphData {
  title: string;
  description: string;
  type: string;
  url?: string;
  image?: string;
  site_name: string;
}

export interface TwitterCardData {
  card: string;
  title: string;
  description: string;
  creator?: string;
  image?: string;
}

export interface GeneratedPage {
  path: string;
  html: string;
  title: string;
  description: string;
}

export class SiteGenerator {
  private templateMap: Map<string, any>;

  constructor() {
    this.templateMap = new Map([
      ['modern-web', ModernWebTemplate],
      ['developer-library', DeveloperLibraryTemplate],
      ['technical-showcase', TechnicalShowcaseTemplate],
      ['creative-project', CreativeProjectTemplate],
      ['startup-product', StartupProductTemplate],
      ['minimal-portfolio', MinimalPortfolioTemplate],
    ]);
  }

  async generateSite(config: SiteGenerationConfig): Promise<GeneratedSiteData> {
    console.log(`Generating site: ${config.siteName} using template: ${config.templateType}`);

    // Select and prepare template
    const Template = this.selectTemplate(config.templateType);
    const templateProps = this.prepareTemplateProps(config);

    // Generate HTML
    const html = this.renderTemplate(Template, templateProps);

    // Generate CSS
    const css = await this.generateCSS(config);

    // Generate JavaScript
    const js = await this.generateJS(config);

    // Generate assets
    const assets = await this.generateAssets(config);

    // Generate metadata
    const metadata = this.generateMetadata(config);

    // Generate additional pages
    const pages = await this.generateAdditionalPages(config);

    return {
      html,
      css,
      js,
      assets,
      metadata,
      pages,
    };
  }

  private selectTemplate(templateType: string): any {
    const Template = this.templateMap.get(templateType);
    if (!Template) {
      console.warn(`Template ${templateType} not found, using modern-web template`);
      return this.templateMap.get('modern-web');
    }
    return Template;
  }

  private prepareTemplateProps(config: SiteGenerationConfig): any {
    const { siteName, siteDescription, analysisResult, customizations, features } = config;

    // Process content sections
    const processedSections = analysisResult.content_sections.map(section => ({
      ...section,
      html: marked(section.content),
      id: this.slugify(section.title),
    }));

    // Process partner recommendations
    const partners = analysisResult.partner_recommendations
      .sort((a, b) => b.placement_priority - a.placement_priority)
      .slice(0, 3); // Top 3 partners

    // Extract hero content
    const heroSection = processedSections.find(s => s.section_type === 'overview' || s.section_type === 'main');
    const featuresSection = processedSections.filter(s => s.section_type === 'features');
    const usageSection = processedSections.find(s => s.section_type === 'usage');

    return {
      // Site info
      siteName,
      siteDescription: siteDescription || heroSection?.content || `Welcome to ${siteName}`,
      
      // Hero section
      hero: {
        title: siteName,
        subtitle: siteDescription || `Discover the power of ${siteName}`,
        description: heroSection?.content || '',
        cta: this.generateHeroCTA(analysisResult),
      },

      // Features
      features: this.extractFeatures(analysisResult, featuresSection),

      // Tech stack
      techStack: analysisResult.tech_stack.map(tech => ({
        name: tech,
        icon: this.getTechIcon(tech),
        description: this.getTechDescription(tech),
      })),

      // Demo section
      demo: features.includeDemo ? {
        title: 'See It In Action',
        description: 'Experience the capabilities firsthand',
        demoUrl: this.generateDemoUrl(analysisResult),
        screenshots: this.generateScreenshots(analysisResult),
      } : null,

      // Installation/Usage
      usage: usageSection ? {
        title: usageSection.title,
        content: usageSection.html,
        codeBlocks: this.extractCodeBlocks(usageSection.content),
      } : null,

      // Partners
      partners: partners.map(partner => ({
        name: partner.partner_name,
        ctaText: partner.cta_text,
        description: this.getPartnerDescription(partner.partner_name),
        logo: this.getPartnerLogo(partner.partner_name),
        url: this.getPartnerUrl(partner.partner_name),
      })),

      // Footer
      footer: this.generateFooter(analysisResult),

      // Customizations
      theme: {
        primaryColor: customizations.primaryColor || '#3B82F6',
        secondaryColor: customizations.secondaryColor || '#1E40AF',
        accentColor: customizations.accentColor || '#F59E0B',
        fontFamily: customizations.fontFamily || 'Inter, sans-serif',
        ...customizations,
      },

      // SEO
      seo: {
        title: siteName,
        description: siteDescription || `${siteName} - Professional project showcase`,
        keywords: analysisResult.seo_keywords,
        canonicalUrl: `https://${this.slugify(siteName)}.project4site.com`,
      },
    };
  }

  private renderTemplate(Template: any, props: any): string {
    try {
      const element = React.createElement(Template, props);
      return renderToStaticMarkup(element);
    } catch (error) {
      console.error('Template rendering error:', error);
      throw new Error(`Failed to render template: ${error.message}`);
    }
  }

  private async generateCSS(config: SiteGenerationConfig): Promise<string> {
    const { templateType, customizations } = config;
    
    // Base CSS
    let css = await this.loadBaseCss();
    
    // Template-specific CSS
    css += await this.loadTemplateCss(templateType);
    
    // Custom theme CSS
    css += this.generateThemeCSS(customizations);
    
    // Responsive CSS
    css += this.generateResponsiveCSS();
    
    return css;
  }

  private async generateJS(config: SiteGenerationConfig): Promise<string> {
    const { features } = config;
    
    let js = '';
    
    // Base interactions
    js += await this.loadBaseJS();
    
    // Feature-specific JS
    if (features.includeDemo) {
      js += await this.loadDemoJS();
    }
    
    if (features.enableVideo) {
      js += await this.loadVideoJS();
    }
    
    // Analytics tracking
    js += this.generateAnalyticsJS(config);
    
    return js;
  }

  private async generateAssets(config: SiteGenerationConfig): Promise<SiteAsset[]> {
    const assets: SiteAsset[] = [];
    
    // Generate placeholder images
    assets.push(...await this.generatePlaceholderImages(config));
    
    // Generate favicon
    assets.push(await this.generateFavicon(config));
    
    // Generate social media images
    assets.push(...await this.generateSocialImages(config));
    
    return assets;
  }

  private generateMetadata(config: SiteGenerationConfig): SiteMetadata {
    const { siteName, siteDescription, analysisResult } = config;
    
    const title = siteName;
    const description = siteDescription || `${siteName} - Professional project showcase`;
    const keywords = analysisResult.seo_keywords;
    const canonical = `https://${this.slugify(siteName)}.project4site.com`;
    
    return {
      title,
      description,
      keywords,
      author: 'Project4Site',
      generator: 'Project4Site v1.0',
      viewport: 'width=device-width, initial-scale=1',
      canonical,
      openGraph: {
        title,
        description,
        type: 'website',
        url: canonical,
        site_name: siteName,
        image: `${canonical}/og-image.png`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image: `${canonical}/twitter-image.png`,
      },
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: siteName,
        description,
        url: canonical,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        programmingLanguage: analysisResult.tech_stack,
      },
    };
  }

  private async generateAdditionalPages(config: SiteGenerationConfig): Promise<GeneratedPage[]> {
    const pages: GeneratedPage[] = [];
    
    // Generate documentation pages
    const docSections = config.analysisResult.content_sections.filter(
      s => s.section_type === 'documentation' || s.section_type === 'api_reference'
    );
    
    for (const section of docSections) {
      pages.push({
        path: `/${this.slugify(section.title)}.html`,
        html: this.renderDocumentationPage(section, config),
        title: `${section.title} - ${config.siteName}`,
        description: section.content.substring(0, 160),
      });
    }
    
    return pages;
  }

  // Helper methods
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateHeroCTA(analysisResult: AnalysisResult): any {
    if (analysisResult.project_type === 'web-application') {
      return {
        primary: { text: 'Try Demo', href: '#demo' },
        secondary: { text: 'View Source', href: '#source' },
      };
    } else if (analysisResult.project_type === 'library') {
      return {
        primary: { text: 'Get Started', href: '#installation' },
        secondary: { text: 'Documentation', href: '#docs' },
      };
    } else {
      return {
        primary: { text: 'Learn More', href: '#features' },
        secondary: { text: 'View Project', href: '#project' },
      };
    }
  }

  private extractFeatures(analysisResult: AnalysisResult, featuresSection: ContentSection[]): any[] {
    // Combine AI-detected features with content sections
    const features = analysisResult.key_features.map(feature => ({
      title: feature,
      description: `Advanced ${feature.toLowerCase()} capabilities`,
      icon: this.getFeatureIcon(feature),
    }));

    // Add features from content sections
    featuresSection.forEach(section => {
      features.push({
        title: section.title,
        description: this.extractDescription(section.content),
        icon: this.getFeatureIcon(section.title),
      });
    });

    return features.slice(0, 6); // Limit to 6 features
  }

  private getTechIcon(tech: string): string {
    const iconMap: Record<string, string> = {
      'JavaScript': 'javascript',
      'TypeScript': 'typescript',
      'React': 'react',
      'Node.js': 'nodejs',
      'Python': 'python',
      'Rust': 'rust',
      'Go': 'go',
      'Docker': 'docker',
    };
    return iconMap[tech] || 'code';
  }

  private getTechDescription(tech: string): string {
    const descriptions: Record<string, string> = {
      'JavaScript': 'Dynamic programming language for web development',
      'TypeScript': 'Typed superset of JavaScript',
      'React': 'Library for building user interfaces',
      'Python': 'Versatile programming language',
      'Rust': 'Systems programming language focused on safety',
    };
    return descriptions[tech] || `${tech} technology`;
  }

  private getFeatureIcon(feature: string): string {
    const feature_lower = feature.toLowerCase();
    if (feature_lower.includes('api')) return 'api';
    if (feature_lower.includes('database')) return 'database';
    if (feature_lower.includes('auth')) return 'shield';
    if (feature_lower.includes('performance')) return 'zap';
    if (feature_lower.includes('security')) return 'lock';
    return 'star';
  }

  private extractDescription(content: string): string {
    // Extract first sentence or paragraph
    const sentences = content.split(/[.!?]+/);
    return sentences[0]?.trim() + '.' || content.substring(0, 100) + '...';
  }

  private generateDemoUrl(analysisResult: AnalysisResult): string {
    // Generate appropriate demo URL based on project type
    return '#demo-placeholder';
  }

  private generateScreenshots(analysisResult: AnalysisResult): string[] {
    // Generate placeholder screenshot URLs
    return [
      '/assets/screenshot-1.png',
      '/assets/screenshot-2.png',
    ];
  }

  private extractCodeBlocks(content: string): any[] {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
    }
    
    return blocks;
  }

  private getPartnerDescription(partnerName: string): string {
    const descriptions: Record<string, string> = {
      'Vercel': 'Deploy your web applications instantly',
      'Supabase': 'Open source Firebase alternative',
      'Railway': 'Deploy without DevOps complexity',
      'Clerk': 'Complete authentication solution',
      'Sentry': 'Application monitoring and error tracking',
    };
    return descriptions[partnerName] || `Enhance your project with ${partnerName}`;
  }

  private getPartnerLogo(partnerName: string): string {
    return `/assets/partners/${this.slugify(partnerName)}-logo.svg`;
  }

  private getPartnerUrl(partnerName: string): string {
    const urls: Record<string, string> = {
      'Vercel': 'https://vercel.com?ref=project4site',
      'Supabase': 'https://supabase.com?ref=project4site',
      'Railway': 'https://railway.app?ref=project4site',
      'Clerk': 'https://clerk.com?ref=project4site',
      'Sentry': 'https://sentry.io?ref=project4site',
    };
    return urls[partnerName] || '#';
  }

  private generateFooter(analysisResult: AnalysisResult): any {
    return {
      text: 'Generated with Project4Site',
      links: [
        { text: 'Create Your Site', href: 'https://project4site.com' },
        { text: 'Documentation', href: 'https://docs.project4site.com' },
      ],
    };
  }

  // Asset generation helpers
  private async loadBaseCss(): Promise<string> {
    try {
      return await fs.readFile(path.join(__dirname, '../assets/css/base.css'), 'utf-8');
    } catch {
      return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
      `;
    }
  }

  private async loadTemplateCss(templateType: string): Promise<string> {
    try {
      return await fs.readFile(path.join(__dirname, `../assets/css/${templateType}.css`), 'utf-8');
    } catch {
      return '/* Template-specific CSS would go here */';
    }
  }

  private generateThemeCSS(customizations: any): string {
    return `
      :root {
        --primary-color: ${customizations.primaryColor || '#3B82F6'};
        --secondary-color: ${customizations.secondaryColor || '#1E40AF'};
        --accent-color: ${customizations.accentColor || '#F59E0B'};
        --text-color: ${customizations.textColor || '#1F2937'};
        --background-color: ${customizations.backgroundColor || '#FFFFFF'};
        --font-family: ${customizations.fontFamily || 'Inter, sans-serif'};
      }
    `;
  }

  private generateResponsiveCSS(): string {
    return `
      @media (max-width: 768px) {
        .container { padding: 0 15px; }
        .hero h1 { font-size: 2rem; }
        .features { grid-template-columns: 1fr; }
      }
    `;
  }

  private async loadBaseJS(): Promise<string> {
    return `
      // Smooth scrolling
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    `;
  }

  private async loadDemoJS(): Promise<string> {
    return `
      // Demo interactions
      const demoTriggers = document.querySelectorAll('.demo-trigger');
      demoTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          console.log('Demo interaction triggered');
        });
      });
    `;
  }

  private async loadVideoJS(): Promise<string> {
    return `
      // Video player enhancements
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.addEventListener('play', () => {
          console.log('Video playback started');
        });
      });
    `;
  }

  private generateAnalyticsJS(config: SiteGenerationConfig): string {
    return `
      // Simple analytics tracking
      function trackEvent(event, data) {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, data, siteId: '${config.siteId}' })
        }).catch(() => {});
      }
      
      // Track page view
      trackEvent('page_view', { url: window.location.href });
    `;
  }

  private async generatePlaceholderImages(config: SiteGenerationConfig): Promise<SiteAsset[]> {
    // In a real implementation, this would generate actual placeholder images
    // For now, return asset definitions
    return [
      {
        type: 'image',
        path: '/assets/hero-image.png',
        content: Buffer.from('placeholder-hero-image'),
        size: 1024,
      },
      {
        type: 'image',
        path: '/assets/feature-1.png',
        content: Buffer.from('placeholder-feature-image'),
        size: 512,
      },
    ];
  }

  private async generateFavicon(config: SiteGenerationConfig): Promise<SiteAsset> {
    return {
      type: 'image',
      path: '/favicon.ico',
      content: Buffer.from('placeholder-favicon'),
      size: 256,
    };
  }

  private async generateSocialImages(config: SiteGenerationConfig): Promise<SiteAsset[]> {
    return [
      {
        type: 'image',
        path: '/og-image.png',
        content: Buffer.from('placeholder-og-image'),
        size: 2048,
      },
      {
        type: 'image',
        path: '/twitter-image.png',
        content: Buffer.from('placeholder-twitter-image'),
        size: 1024,
      },
    ];
  }

  private renderDocumentationPage(section: ContentSection, config: SiteGenerationConfig): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${section.title} - ${config.siteName}</title>
        <meta name="description" content="${section.content.substring(0, 160)}">
        <link rel="stylesheet" href="/assets/style.css">
      </head>
      <body>
        <div class="container">
          <header>
            <h1>${section.title}</h1>
            <nav><a href="/">← Back to ${config.siteName}</a></nav>
          </header>
          <main>
            ${marked(section.content)}
          </main>
        </div>
      </body>
      </html>
    `;
  }
}