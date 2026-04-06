import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/metronic8/react/demo7/",
  build: {
    chunkSizeWarningLimit: 3000,
    commonjsOptions: {
      include: [/firebase/, /node_modules/],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // ✅ Fix: "Service firestore/auth/storage is not available"
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
    ],
  },

  // 🔥 เพิ่มตรงนี้เพื่อให้เข้าจาก IP EC2 ได้
  server: {
    host: true,  // bind ทุก IP
    port: 5173,  // port ที่คุณใช้
  },
})