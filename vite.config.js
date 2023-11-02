import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.png'],
  plugins: [
    vue(),
  ],
  build: {
    rollupOptions: {
      // Hint: Using "external" for TEMPLATE_PATH will break the app

      // Define a custom name for the .html file
      // https://stackoverflow.com/a/71359021
      input: {
        app: './index.html',
      },

      // Avoid having varying names
      // Idea: Do not overwrite the .html file to avoid manipulating the code itself
      // https://github.com/vitejs/vite/issues/378#issuecomment-768816653
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
