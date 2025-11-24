# Backend Dockerfile
FROM node:18-alpine

# Установить зависимости для Puppeteer (для WhatsApp)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Переменные для Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Копировать package.json и установить зависимости
COPY package*.json ./
RUN npm install --production

# Копировать исходный код
COPY . .

# Создать директории для данных
RUN mkdir -p /app/.wwebjs_auth /app/data

EXPOSE 5000

CMD ["node", "src/server.js"]
