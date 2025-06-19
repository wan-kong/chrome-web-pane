import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import manifest from './src/manifest'
import * as path from 'node:path'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const production = mode === 'production'

  return {
    build: {
      cssCodeSplit: true,
      emptyOutDir: true,
      outDir: 'build',
      sourcemap: !production,
      minify: production ? 'esbuild' : false,
      rollupOptions: {
        rollupOptions: {
          output: {
            chunkFileNames: 'assets/chunk-[hash].js',
          },
        },
      },
    },
    plugins: [
      crx({ manifest }),
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        }
      }),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    legacy: {
      skipWebSocketTokenCheck: true,
    },
    define: {
      __DEV__: !production,
      __PROD__: production
    },
    esbuild: {
      drop: production ? ['console', 'debugger'] : []
    },
    server: {
      hmr: {
        port: 5174
      }
    }
  }
})
