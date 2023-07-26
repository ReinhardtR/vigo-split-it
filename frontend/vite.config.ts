import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import Unfonts from "unplugin-fonts/vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  plugins: [
    react(),
    Unfonts({
      google: {
        families: [
          {
            name: "Inter",
            styles: "wght@400;500;600;700",
          },
        ],
      },
    }),
  ],
});
