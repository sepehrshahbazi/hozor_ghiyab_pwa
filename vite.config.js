import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // موقع dev (npm run dev) base همون "/" می‌مونه
  // موقع build (npm run build) base میشه "/employee/"
  base: command === 'build' ? '/employee/' : '/',

  server: {
    host: '0.0.0.0',
    port: 5173,

    // ⏸️ HTTPS غیرفعال شد چون بک‌اند فعلاً روی HTTP هست
    // برای برگشت به HTTPS، این بلاک رو از کامنت خارج کن
    /*
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'cert/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert/server.pem')),
    },
    */
  },
}))