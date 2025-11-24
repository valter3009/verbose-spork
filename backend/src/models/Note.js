import db from '../database/index.js';

export const Note = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO notes (title, content, category, tags, is_important)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title || null,
      data.content,
      data.category || null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.is_important ? 1 : 0
    );
    return Note.findById(result.lastInsertRowid);
  },

  findAll: () => {
    const notes = db.prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
    return notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : [],
      is_important: Boolean(note.is_important)
    }));
  },

  findById: (id) => {
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!note) return null;
    return {
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : [],
      is_important: Boolean(note.is_important)
    };
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
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(data.tags));
    }
    if (data.is_important !== undefined) {
      updates.push('is_important = ?');
      values.push(data.is_important ? 1 : 0);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE notes SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return Note.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  },

  search: (query) => {
    const notes = db.prepare(`
      SELECT * FROM notes
      WHERE title LIKE ? OR content LIKE ? OR category LIKE ?
      ORDER BY created_at DESC
    `).all(`%${query}%`, `%${query}%`, `%${query}%`);

    return notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : [],
      is_important: Boolean(note.is_important)
    }));
  }
};
