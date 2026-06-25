FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Pass DATABASE_URL at build time for prisma generate
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL:-file:/app/prisma/data/masterbangun.db}

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Create volume directories
RUN mkdir -p /app/prisma/data
RUN mkdir -p /app/uploads

# Startup script to push db schema and start prod server
CMD ["node", "dist/src/main"]
