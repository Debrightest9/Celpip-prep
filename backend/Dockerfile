FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" npx prisma generate
RUN npm run build

EXPOSE 5000

CMD npx prisma migrate deploy && node dist/server.js
