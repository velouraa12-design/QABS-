import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createQabsApp } from './server/app.ts';

async function startServer() {
  const port = Number(process.env.PORT || 3000);
  const { app } = createQabsApp();

  let useViteDev = process.env.NODE_ENV !== 'production' && !process.env.K_SERVICE;
  if (useViteDev) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch {
      useViteDev = false;
    }
  }

  if (!useViteDev) {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build dist/index.html not found.');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`QABS Full-Stack Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start QABS server:', err);
  process.exit(1);
});
