import db from '../database/index.js';

export const Goal = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO goals (title, description, category, target_date, progress, status, milestones)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.description || null,
      data.category || null,
      data.target_date || null,
      data.progress || 0,
      data.status || 'active',
      data.milestones ? JSON.stringify(data.milestones) : null
    );
    return Goal.findById(result.lastInsertRowid);
  },

  findAll: () => {
    const goals = db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all();
    return goals.map(goal => ({
      ...goal,
      milestones: goal.milestones ? JSON.parse(goal.milestones) : []
    }));
  },

  findById: (id) => {
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    if (!goal) return null;
    return {
      ...goal,
      milestones: goal.milestones ? JSON.parse(goal.milestones) : []
    };
  },

  findActive: () => {
    const goals = db.prepare(`
      SELECT * FROM goals
      WHERE status = 'active'
      ORDER BY target_date ASC
    `).all();
    return goals.map(goal => ({
      ...goal,
      milestones: goal.milestones ? JSON.parse(goal.milestones) : []
    }));
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
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.target_date !== undefined) {
      updates.push('target_date = ?');
      values.push(data.target_date);
    }
    if (data.progress !== undefined) {
      updates.push('progress = ?');
      values.push(data.progress);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.milestones !== undefined) {
      updates.push('milestones = ?');
      values.push(JSON.stringify(data.milestones));
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE goals SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return Goal.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM goals WHERE id = ?').run(id);
  }
};
