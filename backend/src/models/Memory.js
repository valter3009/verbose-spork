import db from '../database/index.js';

export const Memory = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO memories (title, content, category, context, tags, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.content,
      data.category || null,
      data.context || null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.date || new Date().toISOString().split('T')[0]
    );
    return Memory.findById(result.lastInsertRowid);
  },

  findAll: () => {
    const memories = db.prepare('SELECT * FROM memories ORDER BY date DESC, created_at DESC').all();
    return memories.map(memory => ({
      ...memory,
      tags: memory.tags ? JSON.parse(memory.tags) : []
    }));
  },

  findById: (id) => {
    const memory = db.prepare('SELECT * FROM memories WHERE id = ?').get(id);
    if (!memory) return null;
    return {
      ...memory,
      tags: memory.tags ? JSON.parse(memory.tags) : []
    };
  },

  search: (query) => {
    const memories = db.prepare(`
      SELECT * FROM memories
      WHERE title LIKE ? OR content LIKE ? OR context LIKE ?
      ORDER BY date DESC, created_at DESC
    `).all(`%${query}%`, `%${query}%`, `%${query}%`);

    return memories.map(memory => ({
      ...memory,
      tags: memory.tags ? JSON.parse(memory.tags) : []
    }));
  },

  update: (id, data) => {
    const updates = [];
    const values = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.context !== undefined) {
      updates.push('context = ?');
      values.push(data.context);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(data.tags));
    }
    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE memories SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return Memory.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM memories WHERE id = ?').run(id);
  }
};
