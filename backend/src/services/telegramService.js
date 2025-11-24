import TelegramBot from 'node-telegram-bot-api';
import { Conversation, Message } from '../models/Conversation.js';
import { sendMessage, executeTool } from './claudeService.js';

let bot = null;
let isReady = false;

const WELCOME_MESSAGE = `👋 Привет! Я твой личный AI-помощник.

Я помогу тебе с:
✅ Задачами и напоминаниями
📝 Заметками и идеями
🎯 Целями и прогрессом
📔 Дневником и настроением
💰 Расходами и финансами
🔄 Привычками
👥 Контактами и важными датами
🧠 Запоминанием всего важного о тебе

Просто напиши что тебе нужно, и я помогу!`;

// Инициализация Telegram бота
export const initTelegram = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN не указан в переменных окружения');
    return;
  }

  if (bot) {
    console.log('⚠️  Telegram бот уже инициализирован');
    return;
  }

  console.log('🔄 Инициализация Telegram бота...');

  try {
    // Создать бота
    bot = new TelegramBot(token, { polling: true });

    // Обработка команды /start
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const username = msg.from.username || msg.from.first_name;

      console.log(`👤 Новый пользователь: ${username} (ID: ${userId})`);

      // Найти или создать разговор
      let conversation = Conversation.findByTelegramId(userId);
      if (!conversation) {
        conversation = Conversation.create({
          title: `Telegram: ${username}`,
          platform: 'telegram',
          telegram_id: userId
        });

        // Отправить приветственное сообщение
        await bot.sendMessage(chatId, WELCOME_MESSAGE);
      } else {
        await bot.sendMessage(chatId, 'С возвращением! Чем могу помочь?');
      }
    });

    // Обработка всех текстовых сообщений
    bot.on('message', async (msg) => {
      try {
        // Игнорировать команды (они обрабатываются отдельно)
        if (msg.text && msg.text.startsWith('/')) {
          return;
        }

        // Игнорировать не текстовые сообщения
        if (!msg.text) {
          return;
        }

        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username || msg.from.first_name;
        const text = msg.text;

        console.log(`📨 Новое сообщение от ${username}: ${text}`);

        await handleIncomingMessage(chatId, userId, username, text);
      } catch (error) {
        console.error('❌ Ошибка обработки сообщения:', error);
      }
    });

    // Обработка ошибок
    bot.on('polling_error', (error) => {
      console.error('❌ Ошибка polling:', error);
    });

    isReady = true;
    console.log('✅ Telegram бот готов к работе!');
  } catch (error) {
    console.error('❌ Ошибка инициализации Telegram бота:', error);
    isReady = false;
  }
};

// Отправка сообщения в Telegram
export const sendTelegramMessage = async (chatId, text) => {
  if (!isReady || !bot) {
    throw new Error('Telegram бот не готов');
  }

  try {
    await bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    console.log(`✅ Сообщение отправлено пользователю ${chatId}`);
  } catch (error) {
    console.error('❌ Ошибка отправки сообщения:', error);
    throw error;
  }
};

// Обработка входящего сообщения из Telegram
export const handleIncomingMessage = async (chatId, userId, username, text) => {
  try {
    // Найти или создать разговор для этого пользователя
    let conversation = Conversation.findByTelegramId(userId);
    if (!conversation) {
      conversation = Conversation.create({
        title: `Telegram: ${username}`,
        platform: 'telegram',
        telegram_id: userId
      });

      // Отправить приветственное сообщение
      await sendTelegramMessage(chatId, WELCOME_MESSAGE);
      return;
    }

    // Отправить индикатор "печатает..."
    await bot.sendChatAction(chatId, 'typing');

    // Сохранить сообщение пользователя
    Message.create({
      conversation_id: conversation.id,
      role: 'user',
      content: text
    });

    // Получить историю сообщений
    const messages = Message.findByConversationId(conversation.id);
    const claudeMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Отправить запрос Claude AI (без стриминга для Telegram)
    const response = await sendMessage(claudeMessages, false);

    let assistantMessage = '';
    let toolCalls = [];

    // Обработать ответ
    for (const block of response.content) {
      if (block.type === 'text') {
        assistantMessage += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push(block);
      }
    }

    // Если есть tool calls, выполнить их
    if (toolCalls.length > 0) {
      // Показать индикатор выполнения
      await bot.sendChatAction(chatId, 'typing');

      // Выполнить все tool calls
      const toolResults = toolCalls.map(toolCall => {
        const result = executeTool(toolCall.name, toolCall.input);
        return {
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: JSON.stringify(result)
        };
      });

      // Добавить tool results и получить финальный ответ
      claudeMessages.push({
        role: 'assistant',
        content: response.content
      });
      claudeMessages.push({
        role: 'user',
        content: toolResults
      });

      const finalResponse = await sendMessage(claudeMessages, false);

      // Извлечь текст из финального ответа
      for (const block of finalResponse.content) {
        if (block.type === 'text') {
          assistantMessage = block.text;
        }
      }

      // Сохранить сообщение ассистента с tool calls
      Message.create({
        conversation_id: conversation.id,
        role: 'assistant',
        content: assistantMessage,
        tool_calls: toolCalls
      });
    } else {
      // Сохранить обычное сообщение ассистента
      Message.create({
        conversation_id: conversation.id,
        role: 'assistant',
        content: assistantMessage
      });
    }

    // Отправить ответ в Telegram
    // Разбить длинные сообщения (Telegram имеет лимит 4096 символов)
    const maxLength = 4000;
    if (assistantMessage.length > maxLength) {
      const chunks = assistantMessage.match(new RegExp(`.{1,${maxLength}}`, 'g'));
      for (const chunk of chunks) {
        await sendTelegramMessage(chatId, chunk);
        // Небольшая задержка между сообщениями
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      await sendTelegramMessage(chatId, assistantMessage);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка обработки Telegram сообщения:', error);

    // Отправить сообщение об ошибке пользователю
    try {
      await sendTelegramMessage(chatId, '❌ Произошла ошибка при обработке вашего сообщения. Попробуйте позже.');
    } catch (sendError) {
      console.error('❌ Не удалось отправить сообщение об ошибке:', sendError);
    }

    throw error;
  }
};

// Получить статус Telegram бота
export const getTelegramStatus = () => {
  return {
    isReady,
    botExists: !!bot
  };
};

// Остановить Telegram бота
export const stopTelegram = async () => {
  if (bot) {
    await bot.stopPolling();
    bot = null;
    isReady = false;
    console.log('🔌 Telegram бот остановлен');
  }
};

export default {
  initTelegram,
  sendTelegramMessage,
  handleIncomingMessage,
  getTelegramStatus,
  stopTelegram
};
