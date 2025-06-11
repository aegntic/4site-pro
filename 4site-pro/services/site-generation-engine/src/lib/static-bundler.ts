import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { minify } from 'html-minifier-terser';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import { GeneratedSiteData } from './site-generator';

export interface BundleConfig {
  siteData: GeneratedSiteData;
  outputPath: string;
  optimizeForProduction: boolean;
  generateSitemap: boolean;
  generateRobotsTxt: boolean;
}

export class StaticBundler {
  async bundle(config: BundleConfig): Promise<string> {
    const { siteData, outputPath, optimizeForProduction } = config;
    
    console.log(`Bundling static site to: ${outputPath}`);
    
    // Create output directory
    await fs.mkdir(outputPath, { recursive: true });
    
    // Process and write HTML
    const processedHtml = optimizeForProduction 
      ? await this.minifyHtml(siteData.html)
      : siteData.html;
    
    await this.writeHtmlFile(outputPath, processedHtml, siteData.metadata);
    
    // Process and write CSS
    const processedCss = await this.processCss(siteData.css, optimizeForProduction);
    await fs.writeFile(path.join(outputPath, 'assets', 'style.css'), processedCss);
    
    // Process and write JavaScript
    const processedJs = optimizeForProduction 
      ? await this.minifyJs(siteData.js)
      : siteData.js;
    await fs.writeFile(path.join(outputPath, 'assets', 'script.js'), processedJs);
    
    // Write assets
    await this.writeAssets(outputPath, siteData.assets);
    
    // Generate additional pages
    await this.writeAdditionalPages(outputPath, siteData.pages, optimizeForProduction);
    
    // Generate sitemap and robots.txt
    if (config.generateSitemap) {
      await this.generateSitemap(outputPath, siteData);
    }
    
    if (config.generateRobotsTxt) {
      await this.generateRobotsTxt(outputPath);
    }
    
    // Create deployable archive
    const archivePath = await this.createArchive(outputPath);
    
    console.log(`Bundle created successfully: ${archivePath}`);
    return archivePath;
  }

  private async writeHtmlFile(outputPath: string, html: string, metadata: any): Promise<void> {
    const fullHtml = this.wrapHtmlWithDocument(html, metadata);
    await fs.writeFile(path.join(outputPath, 'index.html'), fullHtml);
  }

  private wrapHtmlWithDocument(html: string, metadata: any): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="${metadata.viewport}">
    <title>${metadata.title}</title>
    <meta name="description" content="${metadata.description}">
    <meta name="keywords" content="${metadata.keywords.join(', ')}">
    <meta name="author" content="${metadata.author}">
    <meta name="generator" content="${metadata.generator}">
    ${metadata.canonical ? `<link rel="canonical" href="${metadata.canonical}">` : ''}
    
    <!-- Open Graph -->
    <meta property="og:title" content="${metadata.openGraph.title}">
    <meta property="og:description" content="${metadata.openGraph.description}">
    <meta property="og:type" content="${metadata.openGraph.type}">
    ${metadata.openGraph.url ? `<meta property="og:url" content="${metadata.openGraph.url}">` : ''}
    ${metadata.openGraph.image ? `<meta property="og:image" content="${metadata.openGraph.image}">` : ''}
    <meta property="og:site_name" content="${metadata.openGraph.site_name}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="${metadata.twitter.card}">
    <meta name="twitter:title" content="${metadata.twitter.title}">
    <meta name="twitter:description" content="${metadata.twitter.description}">
    ${metadata.twitter.creator ? `<meta name="twitter:creator" content="${metadata.twitter.creator}">` : ''}
    ${metadata.twitter.image ? `<meta name="twitter:image" content="${metadata.twitter.image}">` : ''}
    
    <!-- JSON-LD -->
    <script type="application/ld+json">${JSON.stringify(metadata.jsonLd)}</script>
    
    <!-- Favicon -->
    <link rel="icon" href="/favicon.ico">
    
    <!-- Styles -->
    <link rel="stylesheet" href="/assets/style.css">
    
    <!-- Performance optimizations -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
</head>
<body>
    ${html}
    
    <!-- Scripts -->
    <script src="/assets/script.js"></script>
    
    <!-- Analytics -->
    <script>
        // Basic analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID');
        }
    </script>
</body>
</html>`;
  }

  private async minifyHtml(html: string): Promise<string> {
    return await minify(html, {
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      sortClassName: true,
      useShortDoctype: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      minifyCSS: true,
      minifyJS: true,
    });
  }

  private async processCss(css: string, optimize: boolean): Promise<string> {
    const result = await postcss([autoprefixer]).process(css, { from: undefined });
    
    if (optimize) {
      // Additional CSS optimizations could go here
      return result.css.replace(/\s+/g, ' ').trim();
    }
    
    return result.css;
  }

  private async minifyJs(js: string): Promise<string> {
    // Simple JS minification - in production, use terser or similar
    return js
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  }

  private async writeAssets(outputPath: string, assets: any[]): Promise<void> {
    const assetsDir = path.join(outputPath, 'assets');
    await fs.mkdir(assetsDir, { recursive: true });
    
    for (const asset of assets) {
      const assetPath = path.join(outputPath, asset.path.startsWith('/') ? asset.path.slice(1) : asset.path);
      
      // Create directory if needed
      await fs.mkdir(path.dirname(assetPath), { recursive: true });
      
      if (asset.content) {
        await fs.writeFile(assetPath, asset.content);
      } else if (asset.url) {
        // Download external asset (simplified)
        console.log(`External asset referenced: ${asset.url}`);
      }
    }
  }

  private async writeAdditionalPages(outputPath: string, pages: any[], optimize: boolean): Promise<void> {
    for (const page of pages) {
      const pagePath = path.join(outputPath, page.path.startsWith('/') ? page.path.slice(1) : page.path);
      await fs.mkdir(path.dirname(pagePath), { recursive: true });
      
      const html = optimize ? await this.minifyHtml(page.html) : page.html;
      await fs.writeFile(pagePath, html);
    }
  }

  private async generateSitemap(outputPath: string, siteData: any): Promise<void> {
    const baseUrl = siteData.metadata.canonical?.replace(/\/$/, '') || 'https://example.com';
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>1.0</priority>
    </url>`;

    for (const page of siteData.pages) {
      sitemap += `
    <url>
        <loc>${baseUrl}${page.path.replace('.html', '')}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <priority>0.8</priority>
    </url>`;
    }

    sitemap += '\n</urlset>';
    
    await fs.writeFile(path.join(outputPath, 'sitemap.xml'), sitemap);
  }

  private async generateRobotsTxt(outputPath: string): Promise<void> {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: /sitemap.xml`;
    
    await fs.writeFile(path.join(outputPath, 'robots.txt'), robotsTxt);
  }

  private async createArchive(outputPath: string): Promise<string> {
    const archivePath = `${outputPath}.zip`;
    const output = await fs.open(archivePath, 'w');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
      output.createWriteStream().on('close', () => {
        console.log(`Archive created: ${archive.pointer()} bytes`);
        resolve(archivePath);
      });

      archive.on('error', reject);
      archive.pipe(output.createWriteStream());
      archive.directory(outputPath, false);
      archive.finalize();
    });
  }
}