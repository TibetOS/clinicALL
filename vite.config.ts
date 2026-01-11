import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to remove importmap script from production builds (not needed since Vite bundles everything)
function removeImportmapPlugin(): Plugin {
  return {
    name: 'remove-importmap',
    transformIndexHtml(html) {
      // Remove the importmap script tag since it's only used for development
      return html.replace(/<script type="importmap">[\s\S]*?<\/script>\s*/g, '');
    },
    enforce: 'post',
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';

    // SECURITY: Fail build if demo mode is enabled in production
    if (isProduction && env.VITE_ALLOW_DEMO_MODE === 'true') {
      throw new Error(
        'SECURITY ERROR: VITE_ALLOW_DEMO_MODE must not be set in production builds. ' +
        'Remove this environment variable before deploying.'
      );
    }

    // SECURITY: Warn if Gemini API key is set in production (it will be exposed in client bundle)
    if (isProduction && env.VITE_GEMINI_API_KEY) {
      console.warn(
        '\n⚠️  SECURITY WARNING: VITE_GEMINI_API_KEY is set in production!\n' +
        '   This API key will be exposed in the client bundle and can be stolen.\n' +
        '   For production, use Supabase Edge Functions to proxy API calls.\n' +
        '   See .env.example for secure configuration patterns.\n'
      );
    }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Remove importmap from production builds (only needed in dev)
        isProduction && removeImportmapPlugin(),
      ].filter(Boolean),
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
        // SECURITY: Disable source maps in production to prevent source code exposure
        sourcemap: !isProduction,
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
