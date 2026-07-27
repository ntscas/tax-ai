import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      // 1. GitHub Pages 배포 시 상대 경로로 자산을 불러오기 위한 핵심 설정!
      base: './', 
      define: {
        // 2. 환경 변수(GEMINI_API_KEY) 또는 sed 치환값을 가져오도록 수정
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.API_KEY || ''),
      },
      server: {
        proxy: {
          // Target your Node.js backend
          '/api-proxy': 'http://localhost:5000',
          '/ws-proxy': { target: 'ws://localhost:5000', ws: true },
        },
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
