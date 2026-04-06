# Standalone frontend repo (Next.js at repo root — not monorepo paths).
FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "next start -H 0.0.0.0 -p ${PORT:-3000}"]
