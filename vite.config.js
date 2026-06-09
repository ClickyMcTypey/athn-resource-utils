import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        sourcemap: true,
        emptyOutDir: true,
        rollupOptions: {
            input: {
                athn_resourceutils: 'src/main.js'
            },
            output: {
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash][extname]'
            }
        }
    }
});