FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock tsconfig.json bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 3333

CMD ["bun", "run", "start"]
