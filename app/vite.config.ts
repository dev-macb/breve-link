import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => {
    const raiz = fileURLToPath(new URL('../', import.meta.url));
    const env = loadEnv(mode, raiz, '');
    const destino = env.WEB_API_DESTINO || 'http://127.0.0.1:3000';

    const caminhoBase = env.APP_CAMINHO_BASE || '';
    if (caminhoBase && !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(caminhoBase)) {
        throw new Error('APP_CAMINHO_BASE inválido');
    }
    const proxy = {
        [caminhoBase + '/api']: { target: destino, changeOrigin: true },
        [caminhoBase + '/links/redirecionar/']: { target: destino, changeOrigin: true }
    };

    return {
        envDir: raiz,
        base: caminhoBase + '/',
        plugins: [react(), tailwindcss()],
        server: {
            host: 'localhost',
            port: 5173,
            strictPort: true,
            proxy
        },
        preview: {
            host: 'localhost',
            port: 4173,
            strictPort: true,
            proxy
        },
        build: {
            outDir: 'dist',
            sourcemap: false
        }
    };
});
