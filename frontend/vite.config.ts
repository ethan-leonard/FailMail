import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite port
    proxy: {
      // Proxy API requests to the backend server during development
      '/api': { // If your FastAPI routes are not prefixed with /api, adjust accordingly or remove prefix from here.
        target: 'http://localhost:8000', // Your FastAPI backend URL
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // Uncomment if your backend doesn't expect /api prefix
      }
    }
  }
}) 