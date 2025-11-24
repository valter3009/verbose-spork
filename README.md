# 🤖 Личный AI-помощник

Полнофункциональное веб-приложение с интеграцией Claude AI и WhatsApp для управления всеми аспектами вашей жизни.

## ✨ Возможности

### 🎯 Основной функционал
- **Заметки** - сохраняйте идеи, мысли и важную информацию
- **Задачи** - управляйте задачами с приоритетами и сроками
- **Напоминания** - не забывайте о важных событиях
- **Цели** - ставьте цели и отслеживайте прогресс
- **Дневник** - ведите личный дневник с настроением и энергией
- **Контакты** - храните информацию о важных людях
- **Расходы** - отслеживайте финансы и категоризируйте траты
- **Привычки** - формируйте полезные привычки с отслеживанием серий
- **Память AI** - AI запоминает важные факты о вас

### 🤖 AI-помощник (Claude)
- Общайтесь с AI через веб-интерфейс или WhatsApp
- AI имеет доступ ко всем вашим данным через function calling
- Проактивные советы и анализ паттернов
- Умное структурирование информации
- Реал-тайм стриминг ответов

### 📱 WhatsApp интеграция
- Полный доступ к AI-помощнику через WhatsApp
- Все функции доступны в мессенджере
- Синхронизация между веб и WhatsApp
- Приветственное сообщение при подключении

## 🏗️ Архитектура

### Backend (Node.js + Express)
- **База данных**: SQLite (9 сущностей + разговоры)
- **AI**: Claude 3.5 Sonnet с function calling
- **WhatsApp**: Twilio API
- **API**: REST endpoints для всех сущностей
- **Streaming**: Server-Sent Events для реал-тайм чата

### Frontend (React + Vite)
- **UI**: TailwindCSS с темной темой и градиентами
- **Роутинг**: React Router
- **Состояние**: TanStack Query (React Query)
- **Иконки**: Lucide React
- **Анимации**: Framer Motion
- **Markdown**: React Markdown для форматирования

## 🚀 Установка и запуск

### Требования
- Node.js 18+
- npm или yarn

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd verbose-spork
```

### 2. Настройка Backend

```bash
cd backend

# Установка зависимостей
npm install

# Создать .env файл
cp .env.example .env

# Настроить переменные окружения в .env:
# - ANTHROPIC_API_KEY (ваш API ключ Claude)
# - TWILIO_ACCOUNT_SID (для WhatsApp)
# - TWILIO_AUTH_TOKEN (для WhatsApp)
# - TWILIO_WHATSAPP_NUMBER (для WhatsApp)

# Запустить сервер
npm start

# Или в режиме разработки
npm run dev
```

Backend запустится на `http://localhost:5000`

### 3. Настройка Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Запустить dev сервер
npm run dev
```

Frontend запустится на `http://localhost:3000`

### 4. Настройка WhatsApp (опционально)

#### Через Twilio:

1. Создайте аккаунт на [Twilio](https://www.twilio.com)
2. Получите WhatsApp Sandbox номер
3. Настройте Webhook URL: `https://your-domain.com/api/whatsapp/webhook`
4. Добавьте credentials в `.env`:
   ```
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

#### Для продакшена:
- Настройте WhatsApp Business API через Twilio
- Получите одобрение WhatsApp Business
- Настройте домен и SSL сертификат
- Обновите Webhook URL на продакшен домен

## 📁 Структура проекта

```
verbose-spork/
├── backend/
│   ├── src/
│   │   ├── database/       # Схема БД и инициализация
│   │   ├── models/         # 9 моделей данных
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Claude AI & WhatsApp сервисы
│   │   └── server.js       # Основной сервер
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Chat.jsx
│   │   │   └── MessageBubble.jsx
│   │   ├── pages/          # Страницы для всех сущностей
│   │   ├── services/       # API клиент
│   │   ├── App.jsx         # Роутинг
│   │   └── main.jsx        # Точка входа
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🎨 Дизайн

### Цветовая схема
- **Фон**: Темный градиент (slate-950 → purple-950)
- **Акценты**: Фиолетово-розовый градиент (purple-500 → pink-500)
- **WhatsApp**: Зеленый градиент (green-500 → emerald-500)
- **Карточки**: Стеклянный эффект с backdrop-blur

### Компоненты UI
- Glass cards с прозрачностью и размытием
- Градиентные кнопки и текст
- Sidebar с иконками навигации
- Адаптивный дизайн для мобильных и десктопа

## 🔧 API Endpoints

### Базовый URL: `/api`

#### Сущности (CRUD для всех)
- `GET /api/{entity}` - получить все
- `GET /api/{entity}/:id` - получить по ID
- `POST /api/{entity}` - создать
- `PUT /api/{entity}/:id` - обновить
- `DELETE /api/{entity}/:id` - удалить

Где `{entity}` может быть:
- notes, tasks, reminders, goals, journals, contacts, expenses, habits, memories

#### AI Chat
- `POST /api/chat` - отправить сообщение (streaming SSE)
- `POST /api/chat/tools` - выполнить tool calls

#### WhatsApp
- `POST /api/whatsapp/webhook` - webhook для входящих сообщений

#### Dashboard
- `GET /api/dashboard/stats` - получить статистику

## 🤖 Claude AI Functions

AI имеет доступ к следующим функциям:

**Notes**: create_note, get_notes, update_note, delete_note
**Tasks**: create_task, get_tasks, update_task, delete_task
**Reminders**: create_reminder, get_reminders, update_reminder, delete_reminder
**Goals**: create_goal, get_goals, update_goal, delete_goal
**Journals**: create_journal, get_journals, update_journal
**Contacts**: create_contact, get_contacts, update_contact, delete_contact
**Expenses**: create_expense, get_expenses, delete_expense
**Habits**: create_habit, get_habits, update_habit, delete_habit
**Memories**: create_memory, get_memories, update_memory, delete_memory

## 📱 Использование через WhatsApp

После настройки Twilio:

1. Отправьте `join <sandbox-word>` на WhatsApp Sandbox номер
2. Напишите любое сообщение боту
3. Получите приветственное сообщение
4. Используйте все функции AI через чат

Примеры команд:
- "Добавь задачу: купить молоко"
- "Напомни мне через 30 минут позвонить маме"
- "Сколько я потратил в этом месяце?"
- "Покажи мои активные цели"
- "Запиши в дневник: отличный день!"

## 🔐 Безопасность

- API ключи хранятся в `.env` (не коммитить!)
- База данных SQLite локально
- WhatsApp через защищенный Twilio API
- CORS настроен для frontend

## 🚢 Деплой

### Backend
- Развернуть на любом Node.js хостинге (Heroku, Railway, Render)
- Настроить переменные окружения
- Настроить публичный URL для WhatsApp webhook

### Frontend
- Собрать: `npm run build`
- Развернуть на Vercel, Netlify или любом статическом хостинге
- Обновить API_BASE в production

### База данных
- SQLite файл автоматически создастся
- Для продакшена рекомендуется PostgreSQL или MySQL

## 📝 Лицензия

MIT

## 👨‍💻 Автор

Создано с помощью Claude AI

---

## 🎯 Roadmap

- [ ] Мобильное приложение (React Native)
- [ ] Telegram бот интеграция
- [ ] Голосовые сообщения с транскрипцией
- [ ] Умные уведомления на основе AI
- [ ] Экспорт данных (JSON, CSV, PDF)
- [ ] Темы оформления (light mode)
- [ ] Мультиязычность
- [ ] Шаринг целей и задач
- [ ] Аналитика и инсайты от AI
- [ ] Календарь-вид для задач и напоминаний

## 🤝 Вклад

Pull requests приветствуются! Для больших изменений сначала откройте issue.

## ❓ FAQ

**Q: Как получить Claude API ключ?**
A: Зарегистрируйтесь на [console.anthropic.com](https://console.anthropic.com)

**Q: WhatsApp обязателен?**
A: Нет, приложение работает и без WhatsApp через веб-интерфейс

**Q: Можно ли использовать другую LLM?**
A: Да, но потребуется адаптация сервиса (Claude API специфичен)

**Q: Данные хранятся в облаке?**
A: Нет, все данные локально в SQLite (кроме API запросов к Claude)

## 📞 Поддержка

Если возникли вопросы или проблемы, создайте issue в репозитории.

---

**Наслаждайтесь вашим личным AI-помощником! 🚀**
