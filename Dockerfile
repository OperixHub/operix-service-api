# Usa imagem oficial do Node
FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos de configuração primeiro
COPY package.json bun.lock tsconfig.json ./

# Instala Bun globalmente via npm
RUN npm install -g bun

# Instala dependências
RUN bun install

# Copia o restante do código
COPY . .

# Copia o .env.example e renomeia para .env
RUN cp .env.example .env

# Expõe a porta da aplicação
EXPOSE 3333

# Comando para iniciar a aplicação
CMD ["bun", "run", "dev"]