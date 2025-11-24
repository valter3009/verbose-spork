import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Edit2, Trash2, Save, X, Clock, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const RemindersPage = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    remind_at: '',
    is_recurring: false,
    recurring_pattern: '',
    status: 'active',
  });

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: api.reminders.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.reminders.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders']);
      toast.success('Напоминание создано успешно');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.reminders.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders']);
      toast.success('Напоминание обновлено');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.reminders.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders']);
      toast.success('Напоминание удалено');
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      remind_at: '',
      is_recurring: false,
      recurring_pattern: '',
      status: 'active',
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (reminder) => {
    setEditingId(reminder.id);
    setFormData({
      title: reminder.title || '',
      description: reminder.description || '',
      remind_at: reminder.remind_at || '',
      is_recurring: reminder.is_recurring || false,
      recurring_pattern: reminder.recurring_pattern || '',
      status: reminder.status || 'active',
    });
    setIsCreating(true);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Напоминания</h1>
            <p className="text-slate-400">Никогда ничего не забывайте</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gradient-button flex items-center gap-2"
        >
          {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreating ? 'Отмена' : 'Создать напоминание'}
        </button>
      </motion.div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="О чем напомнить?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Дополнительная информация..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Дата и время *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.remind_at}
                    onChange={(e) => setFormData({ ...formData, remind_at: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="active">Активно</option>
                    <option value="completed">Выполнено</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800/50 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="is_recurring" className="text-sm text-slate-300 flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-purple-400" />
                  Повторяющееся напоминание
                </label>
              </div>
              {formData.is_recurring && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Паттерн повторения
                  </label>
                  <input
                    type="text"
                    value={formData.recurring_pattern}
                    onChange={(e) => setFormData({ ...formData, recurring_pattern: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Например: daily, weekly, monthly"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" className="gradient-button flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminders List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Загрузка...</div>
      ) : reminders && reminders.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {reminders.map((reminder) => (
            <motion.div
              key={reminder.id}
              variants={item}
              className="glass-card-hover p-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{reminder.title}</h3>
                    {reminder.description && (
                      <p className="text-slate-400 text-sm mt-1">{reminder.description}</p>
                    )}
                  </div>
                  {reminder.is_recurring && (
                    <Repeat className="w-5 h-5 text-purple-400" />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">
                    <Clock className="w-3 h-3" />
                    {new Date(reminder.remind_at).toLocaleString('ru-RU', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                      reminder.status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : reminder.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-slate-500/20 text-slate-300'
                    }`}
                  >
                    {reminder.status === 'active' ? 'Активно' : reminder.status === 'completed' ? 'Выполнено' : 'Отменено'}
                  </span>
                  {reminder.recurring_pattern && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                      {reminder.recurring_pattern}
                    </span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                  <button
                    onClick={() => handleEdit(reminder)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Удалить это напоминание?')) {
                        deleteMutation.mutate(reminder.id);
                      }
                    }}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">У вас пока нет напоминаний</p>
          <p className="text-slate-500 text-sm mt-2">
            Нажмите "Создать напоминание" чтобы добавить первое
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default RemindersPage;
