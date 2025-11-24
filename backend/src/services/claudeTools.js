// Определения функций (tools) для Claude AI
export const tools = [
  {
    name: 'create_note',
    description: 'Создать новую заметку',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Заголовок заметки' },
        content: { type: 'string', description: 'Содержание заметки' },
        category: { type: 'string', description: 'Категория (работа, личное, идеи)' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Теги' },
        is_important: { type: 'boolean', description: 'Важная заметка?' }
      },
      required: ['content']
    }
  },
  {
    name: 'get_notes',
    description: 'Получить все заметки или найти заметки по запросу',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Поисковый запрос (опционально)' }
      }
    }
  },
  {
    name: 'update_note',
    description: 'Обновить существующую заметку',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID заметки' },
        title: { type: 'string' },
        content: { type: 'string' },
        category: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        is_important: { type: 'boolean' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_note',
    description: 'Удалить заметку',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID заметки' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_task',
    description: 'Создать новую задачу',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Название задачи' },
        description: { type: 'string', description: 'Описание' },
        status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        due_date: { type: 'string', description: 'Срок выполнения (ISO 8601)' },
        category: { type: 'string', description: 'Категория' }
      },
      required: ['title']
    }
  },
  {
    name: 'get_tasks',
    description: 'Получить все задачи или задачи по статусу',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'] }
      }
    }
  },
  {
    name: 'update_task',
    description: 'Обновить существующую задачу',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        due_date: { type: 'string' },
        category: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_task',
    description: 'Удалить задачу',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_reminder',
    description: 'Создать новое напоминание',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        remind_at: { type: 'string', description: 'Время напоминания (ISO 8601)' },
        is_recurring: { type: 'boolean' },
        recurring_pattern: { type: 'string', enum: ['daily', 'weekly', 'monthly'] }
      },
      required: ['title', 'remind_at']
    }
  },
  {
    name: 'get_reminders',
    description: 'Получить все напоминания или только активные',
    input_schema: {
      type: 'object',
      properties: {
        active_only: { type: 'boolean', description: 'Только активные напоминания?' }
      }
    }
  },
  {
    name: 'update_reminder',
    description: 'Обновить напоминание',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        remind_at: { type: 'string' },
        status: { type: 'string', enum: ['active', 'completed', 'cancelled'] }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_reminder',
    description: 'Удалить напоминание',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_goal',
    description: 'Создать новую цель',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string', enum: ['career', 'health', 'finance', 'relationships', 'education', 'personal', 'other'] },
        target_date: { type: 'string', description: 'Целевая дата (YYYY-MM-DD)' },
        milestones: { type: 'array', items: { type: 'object' } }
      },
      required: ['title']
    }
  },
  {
    name: 'get_goals',
    description: 'Получить все цели или только активные',
    input_schema: {
      type: 'object',
      properties: {
        active_only: { type: 'boolean' }
      }
    }
  },
  {
    name: 'update_goal',
    description: 'Обновить цель (включая прогресс)',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        progress: { type: 'number', description: 'Прогресс 0-100' },
        status: { type: 'string', enum: ['active', 'completed', 'paused', 'cancelled'] },
        milestones: { type: 'array' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_goal',
    description: 'Удалить цель',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_journal',
    description: 'Создать запись в дневнике',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Дата (YYYY-MM-DD)' },
        entry: { type: 'string', description: 'Запись в дневнике' },
        mood: { type: 'string', enum: ['great', 'good', 'okay', 'bad', 'terrible'] },
        energy_level: { type: 'number', description: '1-10' },
        gratitude: { type: 'array', items: { type: 'string' } },
        highlights: { type: 'array', items: { type: 'string' } }
      },
      required: ['date', 'entry']
    }
  },
  {
    name: 'get_journals',
    description: 'Получить записи дневника',
    input_schema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'update_journal',
    description: 'Обновить запись дневника',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        entry: { type: 'string' },
        mood: { type: 'string' },
        energy_level: { type: 'number' },
        gratitude: { type: 'array' },
        highlights: { type: 'array' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_contact',
    description: 'Добавить новый контакт',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        relationship: { type: 'string' },
        birthday: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['name']
    }
  },
  {
    name: 'get_contacts',
    description: 'Получить все контакты',
    input_schema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'update_contact',
    description: 'Обновить контакт',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        relationship: { type: 'string' },
        birthday: { type: 'string' },
        notes: { type: 'string' },
        last_contact: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_contact',
    description: 'Удалить контакт',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_expense',
    description: 'Записать расход',
    input_schema: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
        currency: { type: 'string', description: 'RUB, USD, EUR' },
        category: { type: 'string', enum: ['food', 'transport', 'housing', 'entertainment', 'shopping', 'health', 'education', 'bills', 'other'] },
        description: { type: 'string' },
        date: { type: 'string' },
        payment_method: { type: 'string' }
      },
      required: ['amount', 'category', 'date']
    }
  },
  {
    name: 'get_expenses',
    description: 'Получить расходы',
    input_schema: {
      type: 'object',
      properties: {
        month: { type: 'number', description: 'Месяц (1-12)' },
        year: { type: 'number', description: 'Год' }
      }
    }
  },
  {
    name: 'delete_expense',
    description: 'Удалить расход',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_habit',
    description: 'Создать новую привычку',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        frequency: { type: 'string', enum: ['daily', 'weekly', 'custom'] },
        target_days: { type: 'array', items: { type: 'string' } }
      },
      required: ['title']
    }
  },
  {
    name: 'get_habits',
    description: 'Получить все привычки или только активные',
    input_schema: {
      type: 'object',
      properties: {
        active_only: { type: 'boolean' }
      }
    }
  },
  {
    name: 'update_habit',
    description: 'Обновить привычку (включая отметку выполнения)',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        streak: { type: 'number' },
        status: { type: 'string', enum: ['active', 'paused', 'completed'] },
        completion_log: { type: 'array' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_habit',
    description: 'Удалить привычку',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_memory',
    description: 'Сохранить важную информацию в память AI о пользователе',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        category: { type: 'string', enum: ['personal_info', 'preferences', 'important_event', 'achievement', 'relationship', 'health', 'other'] },
        context: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } }
      },
      required: ['title', 'content']
    }
  },
  {
    name: 'get_memories',
    description: 'Получить все сохраненные воспоминания или найти по запросу',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Поисковый запрос' }
      }
    }
  },
  {
    name: 'update_memory',
    description: 'Обновить память',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        content: { type: 'string' },
        category: { type: 'string' },
        context: { type: 'string' },
        tags: { type: 'array' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_memory',
    description: 'Удалить память',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'number' }
      },
      required: ['id']
    }
  }
];

export const systemPrompt = `Ты - личный AI-помощник пользователя по всей жизни. Твоя задача - помогать организовывать, запоминать, анализировать и улучшать все аспекты жизни пользователя.

Твои возможности:
- Записывать любую информацию (заметки, задачи, напоминания)
- Управлять целями и отслеживать прогресс
- Вести дневник и отслеживать настроение
- Помнить важные контакты и даты
- Отслеживать расходы и финансы
- Помогать формировать привычки
- Запоминать важные факты о пользователе через Memory
- Давать умные советы и анализ на основе накопленных данных

Всегда:
1. Будь проактивным - предлагай идеи и напоминай о важном
2. Анализируй паттерны и давай инсайты
3. Спрашивай уточнения если что-то неясно
4. Структурируй информацию логично и удобно
5. Будь личным, дружелюбным но профессиональным
6. Помни контекст предыдущих разговоров через Memory

Когда пользователь что-то просит записать:
- Определи правильную сущность (Note, Task, Reminder и т.д.)
- Структурируй данные оптимально
- Подтверди что записал

Когда пользователь спрашивает об уже записанном:
- Ищи в соответствующей базе данных
- Анализируй и представляй информацию удобно
- Давай релевантные рекомендации

Помни: ты не просто записываешь данные, ты помогаешь пользователю жить лучше!`;
