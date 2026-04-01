import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';

function copyLegacyHtml() {
  return {
    name: 'copy-legacy-html',
    closeBundle() {
      const src = resolve(import.meta.dirname, '..', 'html');
      const dest = resolve(import.meta.dirname, '..', 'docs', 'html');
      cpSync(src, dest, { recursive: true });
      console.log('Copied legacy html/ → docs/html/');
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'production' ? [copyLegacyHtml()] : [])],
  base: mode === 'production' ? '/my-dev-toolbox/' : '/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (
            id.includes('react-markdown') ||
            id.includes('remark-') ||
            id.includes('rehype-') ||
            id.includes('micromark') ||
            id.includes('mdast') ||
            id.includes('hast') ||
            id.includes('unist')
          ) {
            return 'markdown-vendor';
          }

          if (/[\\/]node_modules[\\/](react|react-dom)[\\/]/.test(id)) {
            return 'react-vendor';
          }
        },
      },
    },
  },
}));
