import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dns from 'dns'

// Force IPv4 ordering to fix localhost issues on Windows
dns.setDefaultResultOrder('ipv4first')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['mapbox-gl', 'react-map-gl/mapbox'],
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Listen on all network interfaces
  },
})
