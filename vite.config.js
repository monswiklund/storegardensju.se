import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/storegardensju-react/', // Måste matcha ditt repository-namn
  plugins: [react()],
})