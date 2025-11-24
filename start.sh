#!/bin/bash

# Скрипт для быстрого запуска AI-помощника в Docker

set -e

echo "🚀 Запуск Personal AI Assistant..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не установлен!${NC}"
    echo "Установите Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose не установлен!${NC}"
    echo "Установите Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Файл .env не найден. Создаю из .env.example...${NC}"

    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Отредактируйте .env файл и добавьте ваш ANTHROPIC_API_KEY${NC}"
        echo ""
        read -p "Введите ваш Claude API ключ: " api_key

        if [ -n "$api_key" ]; then
            echo "ANTHROPIC_API_KEY=$api_key" > .env
            echo -e "${GREEN}✅ API ключ сохранен в .env${NC}"
        else
            echo -e "${RED}❌ API ключ не указан. Отредактируйте .env вручную.${NC}"
            exit 1
        fi
    else
        echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
        echo -e "${RED}❌ Добавьте ваш ANTHROPIC_API_KEY в .env файл${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}🔧 Останавливаю старые контейнеры...${NC}"
docker-compose down -v 2>/dev/null || true

echo ""
echo -e "${BLUE}🏗️  Собираю Docker образы...${NC}"
docker-compose build --no-cache

echo ""
echo -e "${BLUE}🚀 Запускаю контейнеры...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}✅ Контейнеры запущены!${NC}"
echo ""
echo "📱 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:5000"
echo "💚 Health:    http://localhost:5000/health"
echo ""
echo -e "${YELLOW}📱 WhatsApp QR-код:${NC}"
echo "   Выполните: docker-compose logs -f backend"
echo "   Найдите QR-код и отсканируйте его в WhatsApp"
echo ""
echo -e "${BLUE}📊 Посмотреть логи:${NC}"
echo "   docker-compose logs -f"
echo ""
echo -e "${BLUE}🛑 Остановить:${NC}"
echo "   docker-compose down"
echo ""
