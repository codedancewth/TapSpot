import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://43.130.53.168:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      },
      '/tiles': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://43.130.53.168:8080/api/v1')
  }
})
