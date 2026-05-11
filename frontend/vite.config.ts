import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/metronic8/react/demo7/",
  
  // ✅ เพิ่มส่วนนี้เพื่อให้เครื่องอื่นใน WiFi เข้าถึงได้โดยไม่ต้องพิมพ์ --host ทุกครั้ง
  server: {
    host: '0.0.0.0', // เปิดรับการเชื่อมต่อจากทุก IP ในวง WiFi
    port: 5173,      // ล็อค Port ไว้ที่ 5173 (ถ้า 5173 เต็ม มันจะเลื่อนไป 5174 เอง)
    strictPort: false,
  },

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
})