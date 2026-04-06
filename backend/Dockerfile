# ── Stage 1: build ────────────────────────────────────────────────
FROM node:22.2.2-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install --workspace=backend --ignore-scripts

COPY backend/ ./backend/

RUN npm run build --workspace=backend

# ── Stage 2: runtime ──────────────────────────────────────────────
FROM node:22.2.2-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install --workspace=backend --omit=dev --ignore-scripts

COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 3333

CMD ["node", "backend/dist/server.js"]
