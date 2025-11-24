import twilio from 'twilio';
import { Conversation, Message } from '../models/Conversation.js';
import { sendMessage, executeTool } from './claudeService.js';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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

// Отправка сообщения в WhatsApp
export const sendWhatsAppMessage = async (to, body) => {
  try {
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: body
    });
    return message;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

// Обработка входящего сообщения из WhatsApp
export const handleIncomingMessage = async (from, body) => {
  try {
    // Убрать префикс whatsapp: если есть
    const phoneNumber = from.replace('whatsapp:', '');

    // Найти или создать разговор для этого номера
    let conversation = Conversation.findByWhatsAppNumber(phoneNumber);
    if (!conversation) {
      conversation = Conversation.create({
        title: `WhatsApp: ${phoneNumber}`,
        platform: 'whatsapp',
        whatsapp_number: phoneNumber
      });

      // Отправить приветственное сообщение
      await sendWhatsAppMessage(phoneNumber, WELCOME_MESSAGE);
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
    await sendWhatsAppMessage(phoneNumber, assistantMessage);

    return { success: true };
  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
    throw error;
  }
};

export default { sendWhatsAppMessage, handleIncomingMessage };
