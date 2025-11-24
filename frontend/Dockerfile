# Frontend Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Копировать package.json и установить зависимости
COPY package*.json ./
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 5 && \
    npm install --legacy-peer-deps --prefer-offline --no-audit

# Копировать исходный код
COPY . .

# Собрать production build
RUN npm run build

# Production stage - используем nginx для раздачи статики
FROM nginx:alpine

# Копировать build из предыдущего stage
COPY --from=build /app/dist /usr/share/nginx/html

# Копировать nginx конфигурацию
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
