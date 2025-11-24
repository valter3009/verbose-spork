import db from '../database/index.js';

export const Contact = {
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO contacts (name, phone, email, relationship, birthday, notes, last_contact, important_dates)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.name,
      data.phone || null,
      data.email || null,
      data.relationship || null,
      data.birthday || null,
      data.notes || null,
      data.last_contact || null,
      data.important_dates ? JSON.stringify(data.important_dates) : null
    );
    return Contact.findById(result.lastInsertRowid);
  },

  findAll: () => {
    const contacts = db.prepare('SELECT * FROM contacts ORDER BY name ASC').all();
    return contacts.map(contact => ({
      ...contact,
      important_dates: contact.important_dates ? JSON.parse(contact.important_dates) : []
    }));
  },

  findById: (id) => {
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    if (!contact) return null;
    return {
      ...contact,
      important_dates: contact.important_dates ? JSON.parse(contact.important_dates) : []
    };
  },

  update: (id, data) => {
    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.relationship !== undefined) {
      updates.push('relationship = ?');
      values.push(data.relationship);
    }
    if (data.birthday !== undefined) {
      updates.push('birthday = ?');
      values.push(data.birthday);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }
    if (data.last_contact !== undefined) {
      updates.push('last_contact = ?');
      values.push(data.last_contact);
    }
    if (data.important_dates !== undefined) {
      updates.push('important_dates = ?');
      values.push(JSON.stringify(data.important_dates));
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return Contact.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
  }
};
