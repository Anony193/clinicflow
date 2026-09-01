# ============================================================
# ClinicFlow — Dockerfile (Production)
#
# Multi-stage build for minimal image size.
# Uses the Next.js standalone output.
# ============================================================

# Stage 1: Build
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package files + install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source + build
COPY . .
RUN bun run db:generate
RUN bun run build

# Stage 2: Production image
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone build + public assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/trpc/health.check || exit 1

# Start the app
CMD ["bun", "server.js"]
