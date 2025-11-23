# 🚀 Быстрый Старт - CryptoBot

## Проблема: "TELEGRAM_BOT_TOKEN is not set"?

### ✅ САМЫЙ ПРОСТОЙ СПОСОБ (Windows)

Запустите файл `setup.bat` - он автоматически всё настроит!

```cmd
setup.bat
```

Затем:
```cmd
docker-compose up -d
```

### ✅ САМЫЙ ПРОСТОЙ СПОСОБ (Linux/Mac)

```bash
./setup.sh
docker-compose up -d
```

---

## Или Вручную:

### Windows:

```cmd
cd C:\Users\Home\Desktop\bots\cryptg\verbose-spork

REM Создать .env файл
echo TELEGRAM_BOT_TOKEN=6905014359:AAEoEDNEgCl-5qRVc2srN8pTUrSnhEs09SA > .env
echo DATABASE_PATH=data/crypto_bot.db >> .env

REM Перезапустить
docker-compose down
docker-compose up -d

REM Смотреть логи
docker-compose logs -f
```

### Linux/Mac:

```bash
cd verbose-spork

# Создать .env файл
cat > .env << EOF
TELEGRAM_BOT_TOKEN=6905014359:AAEoEDNEgCl-5qRVc2srN8pTUrSnhEs09SA
DATABASE_PATH=data/crypto_bot.db
EOF

# Перезапустить
docker-compose down
docker-compose up -d

# Смотреть логи
docker-compose logs -f
```

---

## Альтернатива: Запуск БЕЗ .env файла

Теперь токен встроен в `docker-compose.yml` как значение по умолчанию!

Просто запустите:

```bash
docker-compose down
docker-compose up -d --build
```

---

## ✅ Проверка что бот работает

После запуска вы должны увидеть в логах:

```
Starting CryptoBot...
Alert scheduler started
Bot is running. Press Ctrl+C to stop.
```

Если видите эти сообщения - **всё работает!** 🎉

Откройте Telegram и найдите вашего бота, отправьте `/start`

---

## 📱 Основные Команды

- `/start` - Запуск
- `/price bitcoin` - Цена Bitcoin
- `/top` - Топ 10 криптовалют
- `/portfolio` - Управление портфолио
- `/alert` - Настроить алерты

---

## 🛠️ Управление

```bash
# Статус
docker-compose ps

# Остановить
docker-compose down

# Перезапустить
docker-compose restart

# Логи
docker-compose logs -f

# Обновить
git pull
docker-compose up -d --build
```

---

## ❓ Всё ещё не работает?

1. Убедитесь что Docker запущен
2. Проверьте что порт не занят
3. Посмотрите логи: `docker-compose logs -f`
4. Попробуйте пересобрать: `docker-compose up -d --build`

Если ошибка `TELEGRAM_BOT_TOKEN is required` - значит `.env` файл не создан или неправильный.
