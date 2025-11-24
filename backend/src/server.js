import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './database/index.js';
import routes from './routes/index.js';
import { sendMessage, executeTool, processToolCalls } from './services/claudeService.js';
import { initTelegram, getTelegramStatus, stopTelegram } from './services/telegramService.js';
import { Conversation, Message } from './models/Conversation.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Инициализировать Telegram бота при запуске
initTelegram();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Claude AI Chat endpoint (с поддержкой streaming)
app.post('/api/chat', async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    // Найти или создать разговор
    let conversation;
    if (conversationId) {
      conversation = Conversation.findById(conversationId);
    } else {
      conversation = Conversation.create({ platform: 'web' });
    }

    // Сохранить сообщение пользователя
    Message.create({
      conversation_id: conversation.id,
      role: 'user',
      content: message
    });

    // Получить историю сообщений
    const messages = Message.findByConversationId(conversation.id);
    const claudeMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Настроить SSE для streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Отправить conversation ID клиенту
    res.write(`data: ${JSON.stringify({ type: 'conversation_id', id: conversation.id })}\n\n`);

    // Получить ответ от Claude со streaming
    const stream = await sendMessage(claudeMessages, true);

    let assistantMessage = '';
    let toolCalls = [];

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        if (event.content_block?.type === 'tool_use') {
          res.write(`data: ${JSON.stringify({ type: 'tool_start', tool: event.content_block })}\n\n`);
        }
      } else if (event.type === 'content_block_delta') {
        if (event.delta?.type === 'text_delta') {
          assistantMessage += event.delta.text;
          res.write(`data: ${JSON.stringify({ type: 'text', text: event.delta.text })}\n\n`);
        } else if (event.delta?.type === 'input_json_delta') {
          res.write(`data: ${JSON.stringify({ type: 'tool_input', input: event.delta.partial_json })}\n\n`);
        }
      } else if (event.type === 'content_block_stop') {
        res.write(`data: ${JSON.stringify({ type: 'block_stop' })}\n\n`);
      } else if (event.type === 'message_delta') {
        if (event.delta?.stop_reason === 'tool_use') {
          // Собрать tool calls из содержимого сообщения
          // Нужно получить полное сообщение
          res.write(`data: ${JSON.stringify({ type: 'tool_use_stop' })}\n\n`);
        }
      } else if (event.type === 'message_stop') {
        // Проверить, нужно ли выполнить tool calls
        // Для упрощения, будем обрабатывать tool calls отдельным запросом
        break;
      }
    }

    // Сохранить сообщение ассистента
    if (assistantMessage) {
      Message.create({
        conversation_id: conversation.id,
        role: 'assistant',
        content: assistantMessage
      });
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

// Endpoint для выполнения tool calls
app.post('/api/chat/tools', async (req, res) => {
  try {
    const { conversationId, toolCalls } = req.body;

    const conversation = Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Выполнить все tool calls
    const results = toolCalls.map(toolCall => {
      const result = executeTool(toolCall.name, toolCall.input);
      return {
        tool_use_id: toolCall.id,
        result: result
      };
    });

    // Получить историю сообщений
    const messages = Message.findByConversationId(conversation.id);
    const claudeMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Добавить tool use в последнее сообщение ассистента
    claudeMessages[claudeMessages.length - 1] = {
      role: 'assistant',
      content: [
        ...toolCalls.map(tc => ({
          type: 'tool_use',
          id: tc.id,
          name: tc.name,
          input: tc.input
        }))
      ]
    };

    // Добавить tool results
    claudeMessages.push({
      role: 'user',
      content: results.map(r => ({
        type: 'tool_result',
        tool_use_id: r.tool_use_id,
        content: JSON.stringify(r.result)
      }))
    });

    // Получить финальный ответ
    const response = await sendMessage(claudeMessages, false);

    let finalMessage = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        finalMessage += block.text;
      }
    }

    // Сохранить финальное сообщение
    Message.create({
      conversation_id: conversation.id,
      role: 'assistant',
      content: finalMessage
    });

    res.json({ message: finalMessage, results: results });
  } catch (error) {
    console.error('Tool execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Telegram Status - получить статус бота
app.get('/api/telegram/status', (req, res) => {
  try {
    const status = getTelegramStatus();
    res.json(status);
  } catch (error) {
    console.error('Telegram status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Telegram Stop - остановить бота
app.post('/api/telegram/stop', async (req, res) => {
  try {
    await stopTelegram();
    res.json({ success: true, message: 'Telegram бот остановлен' });
  } catch (error) {
    console.error('Telegram stop error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Telegram Restart - перезапустить бота
app.post('/api/telegram/restart', async (req, res) => {
  try {
    await stopTelegram();
    initTelegram();
    res.json({ success: true, message: 'Telegram бот перезапускается...' });
  } catch (error) {
    console.error('Telegram restart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Assistant API is running' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Assistant Backend запущен на порту ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`💬 Chat: http://localhost:${PORT}/api/chat`);
  console.log(`🤖 Telegram Bot: Ready to receive messages\n`);
});

export default app;
