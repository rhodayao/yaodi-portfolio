FROM node:22-alpine AS build

WORKDIR /app
RUN npm install -g pnpm@11.28.5

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY index.html tsconfig.json ./
COPY public ./public
COPY backend ./backend
COPY server ./server
COPY src ./src
COPY scripts ./scripts
RUN pnpm build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787
ENV HOST=0.0.0.0
ENV DATA_DIR=/app/storage/data
ENV UPLOAD_DIR=/app/storage/uploads

RUN npm install -g pnpm@11.28.5
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/backend ./backend

RUN mkdir -p /app/storage/data/backups /app/storage/uploads

EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -q -O - http://127.0.0.1:8787/api/health || exit 1

CMD ["node", "server/index.js"]
