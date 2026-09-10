import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Configuración de Vite para el frontend
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Alias @ -> src/ para imports limpios (ej: @/components/ui/button)
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Proxy de /api al backend en desarrollo (evita CORS y fallas de IPv6 localhost en Windows)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
