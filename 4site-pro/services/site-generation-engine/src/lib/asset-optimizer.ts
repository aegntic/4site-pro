import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export interface OptimizationConfig {
  bundlePath: string;
  optimizeImages: boolean;
  minifyCSS: boolean;
  minifyJS: boolean;
  generateWebP: boolean;
  compressFiles: boolean;
}

export class AssetOptimizer {
  async optimize(config: OptimizationConfig): Promise<void> {
    console.log('Starting asset optimization...');
    
    if (config.optimizeImages) {
      await this.optimizeImages(config.bundlePath, config.generateWebP);
    }
    
    console.log('Asset optimization completed');
  }

  private async optimizeImages(bundlePath: string, generateWebP: boolean): Promise<void> {
    const assetsDir = path.join(bundlePath, 'assets');
    
    try {
      const files = await fs.readdir(assetsDir, { recursive: true });
      
      for (const file of files) {
        if (typeof file === 'string' && /\.(jpg|jpeg|png)$/i.test(file)) {
          const filePath = path.join(assetsDir, file);
          await this.optimizeImage(filePath, generateWebP);
        }
      }
    } catch (error) {
      console.warn('Image optimization failed:', error);
    }
  }

  private async optimizeImage(imagePath: string, generateWebP: boolean): Promise<void> {
    try {
      // Optimize original image
      await sharp(imagePath)
        .jpeg({ quality: 85, progressive: true })
        .png({ compressionLevel: 9 })
        .toFile(imagePath + '.optimized');
      
      await fs.rename(imagePath + '.optimized', imagePath);
      
      // Generate WebP version
      if (generateWebP) {
        const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        await sharp(imagePath)
          .webp({ quality: 85 })
          .toFile(webpPath);
      }
    } catch (error) {
      console.warn(`Failed to optimize image ${imagePath}:`, error);
    }
  }
}