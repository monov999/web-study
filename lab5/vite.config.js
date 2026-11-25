import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import prefixSelector from 'postcss-prefix-selector';

export default defineConfig({
  plugins: [react(), vue()],
  css: {
    postcss: {
      plugins: [
        prefixSelector({
          prefix: '.mfe-react',
          includeFiles: [/[\\/]microfrontends[\\/]react[\\/]style\.css$/],
        }),
        prefixSelector({
          prefix: '.mfe-vue',
          includeFiles: [/[\\/]microfrontends[\\/]vue[\\/]style\.css$/],
        }),
      ],
    },
  },
});
