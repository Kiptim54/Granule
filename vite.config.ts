import path from "node:path";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

// Each embedded React route (e.g. src/routes/femicide, src/routes/naya-kenya)
// uses its own "@/..." import convention pointing at its own src/ dir. This
// resolves "@/..." relative to the nearest ancestor routes/<name>/src, so
// every embedded React app can share the same alias without colliding.
function reactRouteAlias(): Plugin {
  return {
    name: "react-route-alias",
    resolveId(source, importer) {
      if (!source.startsWith("@/") || !importer) return null;
      const match = importer.match(/[\\/]src[\\/]routes[\\/]([^\\/]+)[\\/]/);
      if (!match) return null;
      const target = path.resolve(
        __dirname,
        "src/routes",
        match[1],
        "src",
        source.slice(2),
      );
      return this.resolve(target, importer, { skipSelf: true });
    },
  };
}

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), reactRouteAlias()],
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
