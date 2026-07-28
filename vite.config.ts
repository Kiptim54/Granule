import path from "node:path";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/routes/femicide/src"),
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-scrollama",
      "lucide-react",
      "embla-carousel-react",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
    ],
  },
});
