# Backend Dockerfile
FROM node:18-alpine

# Установить зависимости для компиляции нативных модулей (better-sqlite3)
RUN apk add --no-cache \
    python3 \
    make \
    g++

WORKDIR /app

# Копировать package.json и установить зависимости
COPY package*.json ./
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 3 && \
    npm install --production --legacy-peer-deps

# Копировать исходный код
COPY . .

# Создать директорию для данных
RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "src/server.js"]
