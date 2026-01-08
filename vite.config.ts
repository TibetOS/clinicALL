import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // SECURITY: Do NOT expose API keys in client bundles
      // Gemini API calls should be proxied through a backend server
      // See: https://ai.google.dev/gemini-api/docs/oauth for secure patterns
      define: {},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Split large dependencies into separate chunks
              'vendor-react': ['react', 'react-dom', 'react-router-dom'],
              'vendor-charts': ['recharts'],
              'vendor-supabase': ['@supabase/supabase-js'],
            }
          }
        }
      }
    };
});
