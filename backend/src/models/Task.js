import db from '../database/index.js';

export const Task = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, due_date, category, completed_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.description || null,
      data.status || 'todo',
      data.priority || 'medium',
      data.due_date || null,
      data.category || null,
      data.completed_date || null
    );
    return Task.findById(result.lastInsertRowid);
  },

  findAll: () => {
    return db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  },

  findById: (id) => {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  },

  findByStatus: (status) => {
    return db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY due_date ASC').all(status);
  },

  update: (id, data) => {
    const updates = [];
    const values = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
      if (data.status === 'done') {
        updates.push('completed_date = CURRENT_TIMESTAMP');
      }
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      values.push(data.priority);
    }
    if (data.due_date !== undefined) {
      updates.push('due_date = ?');
      values.push(data.due_date);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return Task.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }
};
