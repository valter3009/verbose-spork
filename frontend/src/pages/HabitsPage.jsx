import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Edit2, Trash2, Save, X, Flame, Trophy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const HabitsPage = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    status: 'active',
  });

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: api.habits.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.habits.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      toast.success('Привычка создана успешно');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.habits.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      toast.success('Привычка обновлена');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.habits.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      toast.success('Привычка удалена');
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      frequency: 'daily',
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

  const handleEdit = (habit) => {
    setEditingId(habit.id);
    setFormData({
      title: habit.title || '',
      description: habit.description || '',
      frequency: habit.frequency || 'daily',
      status: habit.status || 'active',
    });
    setIsCreating(true);
  };

  const completeToday = (habit) => {
    const today = new Date().toISOString().split('T')[0];
    const completionLog = habit.completion_log || [];

    // Check if already completed today
    if (completionLog.includes(today)) {
      toast.info('Уже выполнено сегодня!');
      return;
    }

    const newLog = [...completionLog, today];
    const newStreak = habit.streak + 1;
    const newBestStreak = Math.max(habit.best_streak || 0, newStreak);

    updateMutation.mutate({
      id: habit.id,
      data: {
        completion_log: newLog,
        streak: newStreak,
        best_streak: newBestStreak,
      },
    });
    toast.success('Отлично! Продолжайте в том же духе!');
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Ежедневно',
      weekly: 'Еженедельно',
      monthly: 'Ежемесячно',
    };
    return labels[frequency] || frequency;
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Привычки</h1>
            <p className="text-slate-400">Формируйте полезные привычки</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gradient-button flex items-center gap-2"
        >
          {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreating ? 'Отмена' : 'Создать привычку'}
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
                  Название привычки *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Например: Утренняя пробежка, Чтение..."
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
                  placeholder="Почему эта привычка важна для вас?"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Частота
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                    <option value="monthly">Ежемесячно</option>
                  </select>
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
                    <option value="active">Активна</option>
                    <option value="paused">На паузе</option>
                    <option value="completed">Завершена</option>
                  </select>
                </div>
              </div>
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

      {/* Habits List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Загрузка...</div>
      ) : habits && habits.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {habits.map((habit) => {
            const today = new Date().toISOString().split('T')[0];
            const completedToday = habit.completion_log?.includes(today);

            return (
              <motion.div
                key={habit.id}
                variants={item}
                className={`glass-card-hover p-5 ${
                  completedToday ? 'border-green-500/50' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {habit.title}
                      </h3>
                      {habit.description && (
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {habit.description}
                        </p>
                      )}
                    </div>
                    {completedToday && (
                      <CheckCircle className="w-6 h-6 text-green-400 fill-green-400" />
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-orange-400 mb-1">
                        <Flame className="w-4 h-4" />
                        <span className="text-xs">Текущая серия</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {habit.streak || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-yellow-400 mb-1">
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs">Лучшая серия</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {habit.best_streak || 0}
                      </p>
                    </div>
                  </div>

                  {/* Frequency and Status */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                      {getFrequencyLabel(habit.frequency)}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                        habit.status === 'active'
                          ? 'bg-green-500/20 text-green-300'
                          : habit.status === 'paused'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {habit.status === 'active' ? 'Активна' : habit.status === 'paused' ? 'На паузе' : 'Завершена'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-slate-700">
                    {habit.status === 'active' && !completedToday && (
                      <button
                        onClick={() => completeToday(habit)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Выполнено
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(habit)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Удалить эту привычку?')) {
                          deleteMutation.mutate(habit.id);
                        }
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">У вас пока нет привычек</p>
          <p className="text-slate-500 text-sm mt-2">
            Нажмите "Создать привычку" чтобы начать формировать полезные привычки
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default HabitsPage;
