import db from '../database/index.js';

export const Journal = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO journals (date, entry, mood, energy_level, gratitude, highlights)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.date,
      data.entry,
      data.mood || null,
      data.energy_level || null,
      data.gratitude ? JSON.stringify(data.gratitude) : null,
      data.highlights ? JSON.stringify(data.highlights) : null
    );
    return Journal.findById(result.lastInsertRowid);
  },

  findAll: () => {
    const journals = db.prepare('SELECT * FROM journals ORDER BY date DESC').all();
    return journals.map(journal => ({
      ...journal,
      gratitude: journal.gratitude ? JSON.parse(journal.gratitude) : [],
      highlights: journal.highlights ? JSON.parse(journal.highlights) : []
    }));
  },

  findById: (id) => {
    const journal = db.prepare('SELECT * FROM journals WHERE id = ?').get(id);
    if (!journal) return null;
    return {
      ...journal,
      gratitude: journal.gratitude ? JSON.parse(journal.gratitude) : [],
      highlights: journal.highlights ? JSON.parse(journal.highlights) : []
    };
  },

  findByDate: (date) => {
    const journal = db.prepare('SELECT * FROM journals WHERE date = ?').get(date);
    if (!journal) return null;
    return {
      ...journal,
      gratitude: journal.gratitude ? JSON.parse(journal.gratitude) : [],
      highlights: journal.highlights ? JSON.parse(journal.highlights) : []
    };
  },

  update: (id, data) => {
    const updates = [];
    const values = [];

    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date);
    }
    if (data.entry !== undefined) {
      updates.push('entry = ?');
      values.push(data.entry);
    }
    if (data.mood !== undefined) {
      updates.push('mood = ?');
      values.push(data.mood);
    }
    if (data.energy_level !== undefined) {
      updates.push('energy_level = ?');
      values.push(data.energy_level);
    }
    if (data.gratitude !== undefined) {
      updates.push('gratitude = ?');
      values.push(JSON.stringify(data.gratitude));
    }
    if (data.highlights !== undefined) {
      updates.push('highlights = ?');
      values.push(JSON.stringify(data.highlights));
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE journals SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return Journal.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM journals WHERE id = ?').run(id);
  }
};
