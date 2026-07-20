# ── Build Angular ──────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ── Serve with nginx ───────────────────────────────────────────
FROM nginx:1.27-alpine

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/lobi-app/browser /usr/share/nginx/html

ENV PORT=8080
ENV API_UPSTREAM=https://lobi-api.up.railway.app/api/

EXPOSE 8080
