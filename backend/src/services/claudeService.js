import Anthropic from '@anthropic-ai/sdk';
import { tools, systemPrompt } from './claudeTools.js';
import { Note } from '../models/Note.js';
import { Task } from '../models/Task.js';
import { Reminder } from '../models/Reminder.js';
import { Goal } from '../models/Goal.js';
import { Journal } from '../models/Journal.js';
import { Contact } from '../models/Contact.js';
import { Expense } from '../models/Expense.js';
import { Habit } from '../models/Habit.js';
import { Memory } from '../models/Memory.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Выполнение tool call
export const executeTool = (toolName, toolInput) => {
  try {
    switch (toolName) {
      // Notes
      case 'create_note':
        return Note.create(toolInput);
      case 'get_notes':
        return toolInput.query ? Note.search(toolInput.query) : Note.findAll();
      case 'update_note':
        return Note.update(toolInput.id, toolInput);
      case 'delete_note':
        Note.delete(toolInput.id);
        return { success: true };

      // Tasks
      case 'create_task':
        return Task.create(toolInput);
      case 'get_tasks':
        return toolInput.status ? Task.findByStatus(toolInput.status) : Task.findAll();
      case 'update_task':
        return Task.update(toolInput.id, toolInput);
      case 'delete_task':
        Task.delete(toolInput.id);
        return { success: true };

      // Reminders
      case 'create_reminder':
        return Reminder.create(toolInput);
      case 'get_reminders':
        return toolInput.active_only ? Reminder.findActive() : Reminder.findAll();
      case 'update_reminder':
        return Reminder.update(toolInput.id, toolInput);
      case 'delete_reminder':
        Reminder.delete(toolInput.id);
        return { success: true };

      // Goals
      case 'create_goal':
        return Goal.create(toolInput);
      case 'get_goals':
        return toolInput.active_only ? Goal.findActive() : Goal.findAll();
      case 'update_goal':
        return Goal.update(toolInput.id, toolInput);
      case 'delete_goal':
        Goal.delete(toolInput.id);
        return { success: true };

      // Journals
      case 'create_journal':
        return Journal.create(toolInput);
      case 'get_journals':
        return Journal.findAll();
      case 'update_journal':
        return Journal.update(toolInput.id, toolInput);

      // Contacts
      case 'create_contact':
        return Contact.create(toolInput);
      case 'get_contacts':
        return Contact.findAll();
      case 'update_contact':
        return Contact.update(toolInput.id, toolInput);
      case 'delete_contact':
        Contact.delete(toolInput.id);
        return { success: true };

      // Expenses
      case 'create_expense':
        return Expense.create(toolInput);
      case 'get_expenses':
        if (toolInput.month && toolInput.year) {
          const startDate = `${toolInput.year}-${String(toolInput.month).padStart(2, '0')}-01`;
          const endDate = new Date(toolInput.year, toolInput.month, 0);
          const endDateStr = `${toolInput.year}-${String(toolInput.month).padStart(2, '0')}-${endDate.getDate()}`;
          return Expense.findByDateRange(startDate, endDateStr);
        }
        return Expense.findAll();
      case 'delete_expense':
        Expense.delete(toolInput.id);
        return { success: true };

      // Habits
      case 'create_habit':
        return Habit.create(toolInput);
      case 'get_habits':
        return toolInput.active_only ? Habit.findActive() : Habit.findAll();
      case 'update_habit':
        return Habit.update(toolInput.id, toolInput);
      case 'delete_habit':
        Habit.delete(toolInput.id);
        return { success: true };

      // Memories
      case 'create_memory':
        return Memory.create(toolInput);
      case 'get_memories':
        return toolInput.query ? Memory.search(toolInput.query) : Memory.findAll();
      case 'update_memory':
        return Memory.update(toolInput.id, toolInput);
      case 'delete_memory':
        Memory.delete(toolInput.id);
        return { success: true };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return { error: error.message };
  }
};

// Отправка сообщения Claude с поддержкой streaming
export const sendMessage = async (messages, stream = true) => {
  try {
    // Получить последние memories для контекста
    const memories = Memory.findAll().slice(0, 10);
    const memoryContext = memories.length > 0
      ? `\n\nВажная информация о пользователе (из Memory):\n${memories.map(m => `- ${m.title}: ${m.content}`).join('\n')}`
      : '';

    const fullSystemPrompt = systemPrompt + memoryContext;

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      system: fullSystemPrompt,
      messages: messages,
      tools: tools,
      stream: stream
    });

    return response;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
};

// Обработка tool calls и получение финального ответа
export const processToolCalls = async (messages, toolCalls) => {
  const toolResults = toolCalls.map(toolCall => {
    const result = executeTool(toolCall.name, toolCall.input);
    return {
      type: 'tool_result',
      tool_use_id: toolCall.id,
      content: JSON.stringify(result)
    };
  });

  // Добавляем результаты tool calls в историю сообщений
  const updatedMessages = [
    ...messages,
    {
      role: 'user',
      content: toolResults
    }
  ];

  // Получаем финальный ответ от Claude
  return await sendMessage(updatedMessages, false);
};

export default { sendMessage, executeTool, processToolCalls };
