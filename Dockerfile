FROM oven/bun:1.3.5

WORKDIR /app

# Copy root files
COPY package.json bun.lock turbo.json tsconfig.json ./
COPY packages/web ./packages/web

# Install dependencies
RUN bun install

# Build
RUN cd packages/web && bun run build

EXPOSE 3000

CMD ["bun", "packages/web/src/server.ts"]
