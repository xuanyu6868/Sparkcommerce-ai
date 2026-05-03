import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Backend handles MiniMax API, no frontend env vars needed
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: ['lhr.life', '.lhr.life', 'localhost', '.loca.lt'],
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
