FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json tsconfig.json bunfig.toml ./
RUN bun install

COPY . .

ENV NODE_ENV=development

EXPOSE 3333

CMD ["sh", "-c", "bun install && bun run dev"]
