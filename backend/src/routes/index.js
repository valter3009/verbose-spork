import express from 'express';
import { Note } from '../models/Note.js';
import { Task } from '../models/Task.js';
import { Reminder } from '../models/Reminder.js';
import { Goal } from '../models/Goal.js';
import { Journal } from '../models/Journal.js';
import { Contact } from '../models/Contact.js';
import { Expense } from '../models/Expense.js';
import { Habit } from '../models/Habit.js';
import { Memory } from '../models/Memory.js';
import { Conversation, Message } from '../models/Conversation.js';

const router = express.Router();

// Универсальная функция для CRUD endpoints
const createCRUDRoutes = (path, model) => {
  // GET all
  router.get(path, (req, res) => {
    try {
      const items = model.findAll();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET by id
  router.get(`${path}/:id`, (req, res) => {
    try {
      const item = model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST create
  router.post(path, (req, res) => {
    try {
      const item = model.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT update
  router.put(`${path}/:id`, (req, res) => {
    try {
      const item = model.update(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE
  router.delete(`${path}/:id`, (req, res) => {
    try {
      model.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// Создание CRUD маршрутов для всех сущностей
createCRUDRoutes('/notes', Note);
createCRUDRoutes('/tasks', Task);
createCRUDRoutes('/reminders', Reminder);
createCRUDRoutes('/goals', Goal);
createCRUDRoutes('/journals', Journal);
createCRUDRoutes('/contacts', Contact);
createCRUDRoutes('/expenses', Expense);
createCRUDRoutes('/habits', Habit);
createCRUDRoutes('/memories', Memory);

// Дополнительные специфичные маршруты
router.get('/tasks/status/:status', (req, res) => {
  try {
    const tasks = Task.findByStatus(req.params.status);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reminders/active', (req, res) => {
  try {
    const reminders = Reminder.findActive();
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/goals/active', (req, res) => {
  try {
    const goals = Goal.findActive();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/habits/active', (req, res) => {
  try {
    const habits = Habit.findActive();
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/expenses/month/:year/:month', (req, res) => {
  try {
    const total = Expense.getTotalByMonth(req.params.year, req.params.month);
    res.json(total);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/notes/search/:query', (req, res) => {
  try {
    const notes = Note.search(req.params.query);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/memories/search/:query', (req, res) => {
  try {
    const memories = Memory.search(req.params.query);
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Разговоры и сообщения
router.get('/conversations', (req, res) => {
  try {
    const conversations = Conversation.findAll();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/conversations/:id', (req, res) => {
  try {
    const conversation = Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    const messages = Message.findByConversationId(req.params.id);
    res.json({ ...conversation, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/conversations', (req, res) => {
  try {
    const conversation = Conversation.create(req.body);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/conversations/:id', (req, res) => {
  try {
    Conversation.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/messages', (req, res) => {
  try {
    const message = Message.create(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Dashboard stats
router.get('/dashboard/stats', (req, res) => {
  try {
    const stats = {
      tasks: {
        total: Task.findAll().length,
        todo: Task.findByStatus('todo').length,
        in_progress: Task.findByStatus('in_progress').length,
        done: Task.findByStatus('done').length
      },
      reminders: {
        total: Reminder.findAll().length,
        active: Reminder.findActive().length
      },
      goals: {
        total: Goal.findAll().length,
        active: Goal.findActive().length
      },
      habits: {
        total: Habit.findAll().length,
        active: Habit.findActive().length
      },
      notes: Note.findAll().length,
      contacts: Contact.findAll().length,
      expenses: Expense.findAll().length,
      journals: Journal.findAll().length,
      memories: Memory.findAll().length
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
