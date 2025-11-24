import db from '../database/index.js';

export const Conversation = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO conversations (title, platform, whatsapp_number, telegram_id)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title || 'Новый разговор',
      data.platform || 'web',
      data.whatsapp_number || null,
      data.telegram_id || null
    );
    return Conversation.findById(result.lastInsertRowid);
  },

  findAll: () => {
    return db.prepare('SELECT * FROM conversations ORDER BY updated_at DESC').all();
  },

  findById: (id) => {
    return db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
  },

  findByWhatsAppNumber: (number) => {
    return db.prepare('SELECT * FROM conversations WHERE whatsapp_number = ? ORDER BY updated_at DESC LIMIT 1').get(number);
  },

  findByTelegramId: (telegramId) => {
    return db.prepare('SELECT * FROM conversations WHERE telegram_id = ? ORDER BY updated_at DESC LIMIT 1').get(telegramId);
  },

  update: (id, data) => {
    const updates = [];
    const values = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE conversations SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return Conversation.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
  }
};

export const Message = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO messages (conversation_id, role, content, tool_calls)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.conversation_id,
      data.role,
      data.content,
      data.tool_calls ? JSON.stringify(data.tool_calls) : null
    );

    // Обновить updated_at разговора
    db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(data.conversation_id);

    return Message.findById(result.lastInsertRowid);
  },

  findById: (id) => {
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    if (!message) return null;
    return {
      ...message,
      tool_calls: message.tool_calls ? JSON.parse(message.tool_calls) : null
    };
  },

  findByConversationId: (conversationId) => {
    const messages = db.prepare(`
      SELECT * FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `).all(conversationId);

    return messages.map(message => ({
      ...message,
      tool_calls: message.tool_calls ? JSON.parse(message.tool_calls) : null
    }));
  },

  delete: (id) => {
    return db.prepare('DELETE FROM messages WHERE id = ?').run(id);
  }
};
