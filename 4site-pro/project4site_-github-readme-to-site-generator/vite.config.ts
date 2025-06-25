import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      plugins: [
        react()
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.FAL_API_KEY': JSON.stringify(env.FAL_API_KEY),
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'esnext',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info']
          },
          mangle: {
            safari10: true
          }
        },
        rollupOptions: {
          output: {
            manualChunks: {
              // Core React and UI
              'react-vendor': ['react', 'react-dom'],
              'ui-vendor': ['framer-motion', 'lucide-react'],
              
              // AI and API services
              'ai-services': ['./services/geminiService'],
              
              // Authentication and context
              'auth-vendor': ['./contexts/AuthContext'],
              
              // Performance and utilities
              'performance': ['./hooks/usePerformance', './utils/serviceWorker'],
              
              // Error handling and feedback
              'error-handling': [
                './components/error/ErrorBoundary', 
                './components/feedback/FeedbackSystem',
                './hooks/useRetry'
              ],
              
              // Templates (lazy loaded)
              'templates': [
                './components/templates/SimplePreviewTemplate',
                './components/templates/CreativeProjectTemplate',
                './components/templates/TechProjectTemplate'
              ]
            }
          }
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: mode === 'development',
        assetsInlineLimit: 4096, // Inline small assets
        cssCodeSplit: true,
        reportCompressedSize: false // Faster builds
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'framer-motion',
          'lucide-react'
        ],
        exclude: [
          // Exclude heavy components that should be lazy loaded
          './components/templates/SimplePreviewTemplate',
          './components/error/ErrorBoundary'
        ]
      },
      server: {
        port: 5173,
        strictPort: false,
        host: true,
        open: false,
        hmr: {
          overlay: true,
        }
      },
      preview: {
        port: 5273,
        strictPort: false,
      },
      esbuild: {
        // Remove debugger statements in production
        drop: mode === 'production' ? ['debugger'] : [],
        // Tree shaking for better optimization
        treeShaking: true
      }
    };
});
