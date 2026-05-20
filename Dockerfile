# ── Production image ──────────────────────────────────────────────────────────
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY src ./src/
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/index.ts"]
