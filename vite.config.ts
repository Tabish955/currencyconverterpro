
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { ViteDevServer } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Service-Worker-Allowed': '/',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        sw: path.resolve(__dirname, 'public/sw.js'),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'configure-response-headers',
      configureServer: (server: ViteDevServer) => {
        server.middlewares.use('/manifest.json', (req: any, res: any, next: any) => {
          res.setHeader('Content-Type', 'application/manifest+json');
          next();
        });
        server.middlewares.use('/sw.js', (req: any, res: any, next: any) => {
          res.setHeader('Content-Type', 'application/javascript');
          next();
        });
        server.middlewares.use('/icons/*.png', (req: any, res: any, next: any) => {
          res.setHeader('Content-Type', 'image/png');
          next();
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
}));
