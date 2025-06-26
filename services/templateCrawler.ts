import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TemplateData {
  name: string;
  html: string;
  css: string;
  js: string;
  metadata: {
    title: string;
    description: string;
    category: string;
    features: string[];
  };
}

class TemplateCrawler {
  private browser: puppeteer.Browser | null = null;

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeTemplate(url: string, name: string): Promise<TemplateData> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    
    try {
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Extract all styles
      const styles = await page.evaluate(() => {
        const styleSheets = Array.from(document.styleSheets);
        let css = '';
        
        styleSheets.forEach(sheet => {
          try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            rules.forEach(rule => {
              css += rule.cssText + '\n';
            });
          } catch (e) {
            // External stylesheets might throw errors
            const linkElement = sheet.ownerNode as HTMLLinkElement;
            if (linkElement && linkElement.href) {
              css += `@import url('${linkElement.href}');\n`;
            }
          }
        });

        // Also get inline styles
        const inlineStyles = Array.from(document.querySelectorAll('style'));
        inlineStyles.forEach(style => {
          css += style.textContent + '\n';
        });

        return css;
      });

      // Extract all scripts
      const scripts = await page.evaluate(() => {
        const scriptElements = Array.from(document.querySelectorAll('script'));
        let js = '';
        
        scriptElements.forEach(script => {
          if (script.textContent && !script.src) {
            js += script.textContent + '\n';
          } else if (script.src && !script.src.includes('analytics') && !script.src.includes('tracking')) {
            js += `// External script: ${script.src}\n`;
          }
        });

        return js;
      });

      // Extract the HTML structure
      const html = await page.content();

      // Extract metadata
      const metadata = await page.evaluate(() => {
        const title = document.title || 'Premium Template';
        const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || 
                          'Premium website template with modern design';
        
        return { title, description };
      });

      return {
        name,
        html: this.cleanHTML(html),
        css: this.optimizeCSS(styles),
        js: this.optimizeJS(scripts),
        metadata: {
          ...metadata,
          category: this.detectCategory(name),
          features: this.detectFeatures(html, styles, scripts)
        }
      };
    } finally {
      await page.close();
    }
  }

  private cleanHTML(html: string): string {
    // Remove tracking scripts, analytics, and external dependencies
    return html
      .replace(/<script[^>]*google[^>]*>.*?<\/script>/gis, '')
      .replace(/<script[^>]*analytics[^>]*>.*?<\/script>/gis, '')
      .replace(/<script[^>]*tracking[^>]*>.*?<\/script>/gis, '')
      .replace(/<noscript>.*?<\/noscript>/gis, '')
      .replace(/<!--.*?-->/gs, '')
      .trim();
  }

  private optimizeCSS(css: string): string {
    // Remove comments and optimize CSS
    return css
      .replace(/\/\*.*?\*\//gs, '')
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/{\s*/g, '{')
      .replace(/}\s*/g, '}')
      .replace(/:\s*/g, ':')
      .replace(/,\s*/g, ',')
      .trim();
  }

  private optimizeJS(js: string): string {
    // Remove console logs and optimize JS
    return js
      .replace(/console\.(log|warn|error|info|debug)\(.*?\);?/g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*.*?\*\//gs, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private detectCategory(name: string): string {
    const categories: Record<string, string[]> = {
      'e-commerce': ['shop', 'store', 'commerce', 'product', 'cart'],
      'portfolio': ['portfolio', 'gallery', 'showcase', 'motion'],
      'dashboard': ['dashboard', 'admin', 'analytics', 'panel'],
      'developer': ['terminal', 'code', 'dev', 'cyber', 'tech']
    };

    const nameLower = name.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => nameLower.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  private detectFeatures(html: string, css: string, js: string): string[] {
    const features: string[] = [];
    const content = (html + css + js).toLowerCase();

    const featurePatterns = {
      'Responsive Design': /media\s*query|responsive|mobile-first/,
      'Animations': /animation|transition|keyframes|gsap|framer-motion/,
      'Dark Mode': /dark-mode|dark-theme|theme-toggle/,
      'Glassmorphism': /backdrop-filter|blur|glass|frosted/,
      'Grid Layout': /display:\s*grid|grid-template/,
      'Flexbox': /display:\s*flex|flexbox/,
      'Custom Fonts': /@font-face|google\s*fonts/,
      'SVG Graphics': /<svg|\.svg/,
      'Parallax': /parallax|scroll-trigger/,
      'Forms': /<form|input|textarea|select/,
      'Modals': /modal|dialog|popup/,
      'Carousel': /carousel|slider|swiper/,
      'Video Background': /<video|video-background/,
      'Gradient Effects': /gradient|linear-gradient|radial-gradient/,
      '3D Effects': /transform-3d|perspective|rotate3d/,
      'Smooth Scroll': /smooth-scroll|scroll-behavior/,
      'Lazy Loading': /lazy|intersection-observer/,
      'PWA Ready': /service-worker|manifest/
    };

    for (const [feature, pattern] of Object.entries(featurePatterns)) {
      if (pattern.test(content)) {
        features.push(feature);
      }
    }

    return features;
  }

  async saveTemplate(template: TemplateData, outputDir: string) {
    const templateDir = path.join(outputDir, template.name);
    await fs.mkdir(templateDir, { recursive: true });

    // Save HTML
    await fs.writeFile(
      path.join(templateDir, 'index.html'),
      template.html,
      'utf-8'
    );

    // Save CSS
    await fs.writeFile(
      path.join(templateDir, 'styles.css'),
      template.css,
      'utf-8'
    );

    // Save JS
    if (template.js.trim()) {
      await fs.writeFile(
        path.join(templateDir, 'script.js'),
        template.js,
        'utf-8'
      );
    }

    // Save metadata
    await fs.writeFile(
      path.join(templateDir, 'metadata.json'),
      JSON.stringify(template.metadata, null, 2),
      'utf-8'
    );

    // Create a React component wrapper
    const reactComponent = this.generateReactComponent(template);
    await fs.writeFile(
      path.join(templateDir, `${template.name}Template.tsx`),
      reactComponent,
      'utf-8'
    );
  }

  private generateReactComponent(template: TemplateData): string {
    const componentName = template.name.replace(/[^a-zA-Z0-9]/g, '');
    
    return `import React, { useEffect } from 'react';

const ${componentName}Template: React.FC<{ data?: any }> = ({ data }) => {
  useEffect(() => {
    // Initialize any JavaScript functionality
    ${template.js ? `
    const script = document.createElement('script');
    script.textContent = \`${template.js.replace(/`/g, '\\`')}\`;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
    ` : ''}
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: \`${template.css.replace(/`/g, '\\`')}\` }} />
      <div dangerouslySetInnerHTML={{ __html: \`${template.html.replace(/`/g, '\\`')}\` }} />
    </>
  );
};

export default ${componentName}Template;

export const metadata = ${JSON.stringify(template.metadata, null, 2)};
`;
  }
}

export default TemplateCrawler;