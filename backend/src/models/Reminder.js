import db from '../database/index.js';

export const Reminder = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO reminders (title, description, remind_at, is_recurring, recurring_pattern, status, notified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.description || null,
      data.remind_at,
      data.is_recurring ? 1 : 0,
      data.recurring_pattern || null,
      data.status || 'active',
      data.notified ? 1 : 0
    );
    return Reminder.findById(result.lastInsertRowid);
  },

  findAll: () => {
    const reminders = db.prepare('SELECT * FROM reminders ORDER BY remind_at ASC').all();
    return reminders.map(r => ({
      ...r,
      is_recurring: Boolean(r.is_recurring),
      notified: Boolean(r.notified)
    }));
  },

  findById: (id) => {
    const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
    if (!reminder) return null;
    return {
      ...reminder,
      is_recurring: Boolean(reminder.is_recurring),
      notified: Boolean(reminder.notified)
    };
  },

  findActive: () => {
    const reminders = db.prepare(`
      SELECT * FROM reminders
      WHERE status = 'active'
      ORDER BY remind_at ASC
    `).all();
    return reminders.map(r => ({
      ...r,
      is_recurring: Boolean(r.is_recurring),
      notified: Boolean(r.notified)
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
    if (data.remind_at !== undefined) {
      updates.push('remind_at = ?');
      values.push(data.remind_at);
    }
    if (data.is_recurring !== undefined) {
      updates.push('is_recurring = ?');
      values.push(data.is_recurring ? 1 : 0);
    }
    if (data.recurring_pattern !== undefined) {
      updates.push('recurring_pattern = ?');
      values.push(data.recurring_pattern);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.notified !== undefined) {
      updates.push('notified = ?');
      values.push(data.notified ? 1 : 0);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE reminders SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return Reminder.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
  }
};
