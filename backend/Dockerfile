FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD npx prisma migrate deploy && node dist/server.js
