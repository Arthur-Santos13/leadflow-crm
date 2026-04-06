# ── Stage 1: build ────────────────────────────────────────────────
FROM node:22.2.2-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/

RUN npm install --workspace=frontend --ignore-scripts

COPY frontend/ ./frontend/

RUN npm run build --workspace=frontend

# ── Stage 2: serve estático com nginx ─────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
