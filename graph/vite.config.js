import { defineConfig } from 'vite'
import FullReload from 'vite-plugin-full-reload'

export default defineConfig({
  plugins: [
    FullReload(['public/js/*', 'public/css/*', 'public/images/*', 'public/res/*'])
  ],
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
