FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Create volume directories
RUN mkdir -p /app/prisma/data
RUN mkdir -p /app/uploads

# Startup script to push db schema and start prod server
CMD npx prisma db push && npm run start:prod
