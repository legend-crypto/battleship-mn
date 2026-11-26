import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import path from 'path';
import fs from 'fs';

/**
 * Serves compiled Compact artifacts (compiler/, zkir/, keys/) from
 * ../contracts/managed/battleship at /midnight-zk during local dev & preview.
 */
function midnightZkAssetsPlugin(): Plugin {
  const managedRoot = path.resolve(__dirname, '../contracts/managed/battleship');
  const handler = (req: any, res: any, next: any) => {
    const reqUrl: string = req.url || '';
    if (!reqUrl.startsWith('/midnight-zk/')) {
      return next();
    }
    const relPath = decodeURIComponent(reqUrl.slice('/midnight-zk/'.length).split('?')[0]);
    const targetPath = path.resolve(managedRoot, relPath);
    if (!targetPath.startsWith(managedRoot) || !fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
      res.statusCode = 404;
      res.end('ZK artifact not found');
      return;
    }
    res.setHeader('Content-Type', targetPath.endsWith('.json') ? 'application/json' : 'application/octet-stream');
    fs.createReadStream(targetPath).pipe(res);
  };

  return {
    name: 'midnight-zk-assets',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), wasm(), midnightZkAssetsPlugin()],
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnightntwrk/onchain-runtime-v4',
      '@midnightntwrk/ledger-v9',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@battleship/shared': path.resolve(__dirname, '../shared/src/index.ts')
    }
  },
  server: {
    port: 3000
  }
});
