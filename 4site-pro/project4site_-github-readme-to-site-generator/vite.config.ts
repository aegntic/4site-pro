import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.FAL_API_KEY': JSON.stringify(env.FAL_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        port: 5173,
        strictPort: false, // This allows Vite to automatically find next available port
        host: true, // Listen on all network interfaces
        open: false, // Don't auto-open browser
        hmr: {
          overlay: true,
        }
      },
      preview: {
        port: 5273,
        strictPort: false,
      }
    };
});
