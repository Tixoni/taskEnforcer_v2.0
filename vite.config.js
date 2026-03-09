import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/taskEnforcer_v2.0/',  
  build: {
    outDir: 'dist',      
    assetsDir: 'assets', 
  }
})