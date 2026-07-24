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
    // Proxy de /api al backend en desarrollo (evita CORS del navegador)
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
