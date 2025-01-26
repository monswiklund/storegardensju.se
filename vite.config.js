import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/storegardensju-react/', // Detta måste matcha repo-namnet exakt
  plugins: [react()],
})