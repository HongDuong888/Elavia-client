import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["swiper"],
  },
  server: {
    host: "0.0.0.0", // Chạy trên tất cả các địa chỉ IP
    port: 5173, // Port của dev server
    allowedHosts: [
      "elavia.tahoanghiep.com", // Thêm domain của bạn vào đây
    ],
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["elavia.tahoanghiep.com"],
  },
});
