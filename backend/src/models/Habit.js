import db from '../database/index.js';

export const Habit = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO habits (title, description, frequency, target_days, streak, best_streak, status, completion_log)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.description || null,
      data.frequency || 'daily',
      data.target_days ? JSON.stringify(data.target_days) : null,
      data.streak || 0,
      data.best_streak || 0,
      data.status || 'active',
      data.completion_log ? JSON.stringify(data.completion_log) : JSON.stringify([])
    );
    return Habit.findById(result.lastInsertRowid);
  },

  findAll: () => {
    const habits = db.prepare('SELECT * FROM habits ORDER BY created_at DESC').all();
    return habits.map(habit => ({
      ...habit,
      target_days: habit.target_days ? JSON.parse(habit.target_days) : [],
      completion_log: habit.completion_log ? JSON.parse(habit.completion_log) : []
    }));
  },

  findById: (id) => {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
    if (!habit) return null;
    return {
      ...habit,
      target_days: habit.target_days ? JSON.parse(habit.target_days) : [],
      completion_log: habit.completion_log ? JSON.parse(habit.completion_log) : []
    };
  },

  findActive: () => {
    const habits = db.prepare(`
      SELECT * FROM habits
      WHERE status = 'active'
      ORDER BY created_at DESC
    `).all();
    return habits.map(habit => ({
      ...habit,
      target_days: habit.target_days ? JSON.parse(habit.target_days) : [],
      completion_log: habit.completion_log ? JSON.parse(habit.completion_log) : []
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
    if (data.frequency !== undefined) {
      updates.push('frequency = ?');
      values.push(data.frequency);
    }
    if (data.target_days !== undefined) {
      updates.push('target_days = ?');
      values.push(JSON.stringify(data.target_days));
    }
    if (data.streak !== undefined) {
      updates.push('streak = ?');
      values.push(data.streak);
    }
    if (data.best_streak !== undefined) {
      updates.push('best_streak = ?');
      values.push(data.best_streak);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.completion_log !== undefined) {
      updates.push('completion_log = ?');
      values.push(JSON.stringify(data.completion_log));
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE habits SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return Habit.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM habits WHERE id = ?').run(id);
  }
};
