FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# Bun inlines BUN_PUBLIC_* when it serves the HTML entrypoint, so the API
# location is baked in here rather than hardcoded in the app.
ARG BUN_PUBLIC_API_URL=http://localhost:5001
ENV BUN_PUBLIC_API_URL=$BUN_PUBLIC_API_URL

ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "start"]