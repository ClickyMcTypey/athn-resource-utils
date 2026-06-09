import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        sourcemap: true,
        rollupOptions: {
            input: 'index.html',
            output: {
                entryFileNames: 'assets/athn-resource-utils.[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash][extname]'
            }
        }
    }
});