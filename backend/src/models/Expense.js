import db from '../database/index.js';

export const Expense = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO expenses (amount, currency, category, description, date, payment_method, is_recurring)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.amount,
      data.currency || 'RUB',
      data.category,
      data.description || null,
      data.date,
      data.payment_method || null,
      data.is_recurring ? 1 : 0
    );
    return Expense.findById(result.lastInsertRowid);
  },

  findAll: () => {
    const expenses = db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
    return expenses.map(expense => ({
      ...expense,
      is_recurring: Boolean(expense.is_recurring)
    }));
  },

  findById: (id) => {
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!expense) return null;
    return {
      ...expense,
      is_recurring: Boolean(expense.is_recurring)
    };
  },

  findByDateRange: (startDate, endDate) => {
    const expenses = db.prepare(`
      SELECT * FROM expenses
      WHERE date BETWEEN ? AND ?
      ORDER BY date DESC
    `).all(startDate, endDate);
    return expenses.map(expense => ({
      ...expense,
      is_recurring: Boolean(expense.is_recurring)
    }));
  },

  getTotalByMonth: (year, month) => {
    const result = db.prepare(`
      SELECT SUM(amount) as total, currency
      FROM expenses
      WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
      GROUP BY currency
    `).all(year.toString(), month.toString().padStart(2, '0'));
    return result;
  },

  update: (id, data) => {
    const updates = [];
    const values = [];

    if (data.amount !== undefined) {
      updates.push('amount = ?');
      values.push(data.amount);
    }
    if (data.currency !== undefined) {
      updates.push('currency = ?');
      values.push(data.currency);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date);
    }
    if (data.payment_method !== undefined) {
      updates.push('payment_method = ?');
      values.push(data.payment_method);
    }
    if (data.is_recurring !== undefined) {
      updates.push('is_recurring = ?');
      values.push(data.is_recurring ? 1 : 0);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return Expense.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  }
};
