import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { Conversation, Message } from '../models/Conversation.js';
import { sendMessage, executeTool } from './claudeService.js';

let whatsappClient = null;
let isReady = false;
let qrCodeData = null;

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

// Инициализация WhatsApp клиента
export const initWhatsApp = () => {
  if (whatsappClient) {
    console.log('⚠️  WhatsApp клиент уже инициализирован');
    return;
  }

  console.log('🔄 Инициализация WhatsApp клиента...');

  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  });

  // QR Code для подключения
  whatsappClient.on('qr', (qr) => {
    console.log('\n📱 QR CODE для подключения WhatsApp:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n👆 Отсканируйте QR код в WhatsApp: Настройки > Связанные устройства > Связать устройство\n');
    qrCodeData = qr;
  });

  // Готовность
  whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp клиент готов к работе!');
    isReady = true;
    qrCodeData = null;
  });

  // Аутентификация
  whatsappClient.on('authenticated', () => {
    console.log('🔐 WhatsApp аутентификация успешна');
  });

  // Ошибка аутентификации
  whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ Ошибка аутентификации WhatsApp:', msg);
    isReady = false;
  });

  // Отключение
  whatsappClient.on('disconnected', (reason) => {
    console.log('⚠️  WhatsApp отключен:', reason);
    isReady = false;
  });

  // Обработка входящих сообщений
  whatsappClient.on('message', async (msg) => {
    try {
      // Игнорировать сообщения от групп и собственные
      if (msg.from.includes('@g.us') || msg.fromMe) {
        return;
      }

      console.log(`📨 Новое сообщение от ${msg.from}: ${msg.body}`);
      await handleIncomingMessage(msg.from, msg.body);
    } catch (error) {
      console.error('❌ Ошибка обработки сообщения:', error);
    }
  });

  // Запуск клиента
  whatsappClient.initialize();
};

// Отправка сообщения в WhatsApp
export const sendWhatsAppMessage = async (to, body) => {
  if (!isReady || !whatsappClient) {
    throw new Error('WhatsApp клиент не готов');
  }

  try {
    // Форматирование номера (если нужно)
    let chatId = to;
    if (!to.includes('@c.us')) {
      // Удалить все нецифровые символы
      const cleanNumber = to.replace(/\D/g, '');
      chatId = `${cleanNumber}@c.us`;
    }

    await whatsappClient.sendMessage(chatId, body);
    console.log(`✅ Сообщение отправлено на ${to}`);
  } catch (error) {
    console.error('❌ Ошибка отправки сообщения:', error);
    throw error;
  }
};

// Обработка входящего сообщения из WhatsApp
export const handleIncomingMessage = async (from, body) => {
  try {
    // Очистить номер
    const phoneNumber = from.replace('@c.us', '');

    // Найти или создать разговор для этого номера
    let conversation = Conversation.findByWhatsAppNumber(phoneNumber);
    if (!conversation) {
      conversation = Conversation.create({
        title: `WhatsApp: ${phoneNumber}`,
        platform: 'whatsapp',
        whatsapp_number: phoneNumber
      });

      // Отправить приветственное сообщение
      await sendWhatsAppMessage(from, WELCOME_MESSAGE);
      return;
    }

    // Сохранить сообщение пользователя
    Message.create({
      conversation_id: conversation.id,
      role: 'user',
      content: body
    });

    // Получить историю сообщений
    const messages = Message.findByConversationId(conversation.id);
    const claudeMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Отправить запрос Claude AI (без стриминга для WhatsApp)
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

    // Отправить ответ в WhatsApp
    await sendWhatsAppMessage(from, assistantMessage);

    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка обработки WhatsApp сообщения:', error);

    // Отправить сообщение об ошибке пользователю
    try {
      await sendWhatsAppMessage(from, '❌ Произошла ошибка при обработке вашего сообщения. Попробуйте позже.');
    } catch (sendError) {
      console.error('❌ Не удалось отправить сообщение об ошибке:', sendError);
    }

    throw error;
  }
};

// Получить статус WhatsApp
export const getWhatsAppStatus = () => {
  return {
    isReady,
    qrCode: qrCodeData,
    clientExists: !!whatsappClient
  };
};

// Отключить WhatsApp
export const disconnectWhatsApp = async () => {
  if (whatsappClient) {
    await whatsappClient.destroy();
    whatsappClient = null;
    isReady = false;
    qrCodeData = null;
    console.log('🔌 WhatsApp клиент отключен');
  }
};

export default {
  initWhatsApp,
  sendWhatsAppMessage,
  handleIncomingMessage,
  getWhatsAppStatus,
  disconnectWhatsApp
};
