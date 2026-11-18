FROM node:22.18-bookworm-slim

ENV NODE_ENV=production \
    PORT=3000 \
    QABS_DB_PATH=/data/qabs.sqlite \
    QABS_ALLOW_SANDBOX_PAYMENTS=false

WORKDIR /app
COPY package.json ./
RUN npm install --include=dev --no-audit --no-fund
COPY . .
RUN npm run build && npx esbuild server.ts --bundle --platform=node --format=esm --packages=external --outfile=server.js && npm prune --omit=dev

RUN mkdir -p /data && chown -R node:node /app /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
