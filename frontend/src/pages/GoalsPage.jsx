import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, Save, X, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const GoalsPage = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    target_date: '',
    progress: 0,
    status: 'active',
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: api.goals.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.goals.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      toast.success('Цель создана успешно');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.goals.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      toast.success('Цель обновлена');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.goals.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      toast.success('Цель удалена');
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      target_date: '',
      progress: 0,
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

  const handleEdit = (goal) => {
    setEditingId(goal.id);
    setFormData({
      title: goal.title || '',
      description: goal.description || '',
      category: goal.category || '',
      target_date: goal.target_date || '',
      progress: goal.progress || 0,
      status: goal.status || 'active',
    });
    setIsCreating(true);
  };

  const updateProgress = (goal, newProgress) => {
    updateMutation.mutate({
      id: goal.id,
      data: { progress: Math.max(0, Math.min(100, newProgress)) },
    });
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Цели</h1>
            <p className="text-slate-400">Достигайте большего каждый день</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gradient-button flex items-center gap-2"
        >
          {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreating ? 'Отмена' : 'Создать цель'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Название цели *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Чего вы хотите достичь?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Категория
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Карьера, Здоровье, Обучение..."
                  />
                </div>
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
                  placeholder="Опишите вашу цель подробнее..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Целевая дата
                  </label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Прогресс (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
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
                    <option value="active">Активна</option>
                    <option value="completed">Достигнута</option>
                    <option value="paused">На паузе</option>
                    <option value="cancelled">Отменена</option>
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

      {/* Goals List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Загрузка...</div>
      ) : goals && goals.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              variants={item}
              className="glass-card-hover p-5"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">{goal.description}</p>
                  )}
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Прогресс
                    </span>
                    <span className="text-sm font-semibold text-purple-400">
                      {goal.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress || 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    />
                  </div>
                  {/* Progress Controls */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateProgress(goal, (goal.progress || 0) - 10)}
                      className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => updateProgress(goal, (goal.progress || 0) + 10)}
                      className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded transition-colors"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => updateProgress(goal, 100)}
                      className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded transition-colors"
                    >
                      Выполнено
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {goal.category && (
                    <span className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                      {goal.category}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                      goal.status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : goal.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-300'
                        : goal.status === 'paused'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-slate-500/20 text-slate-300'
                    }`}
                  >
                    {goal.status === 'active' ? 'Активна' : goal.status === 'completed' ? 'Достигнута' : goal.status === 'paused' ? 'На паузе' : 'Отменена'}
                  </span>
                  {goal.target_date && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                      <Calendar className="w-3 h-3" />
                      {new Date(goal.target_date).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Удалить эту цель?')) {
                        deleteMutation.mutate(goal.id);
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
          <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">У вас пока нет целей</p>
          <p className="text-slate-500 text-sm mt-2">
            Нажмите "Создать цель" чтобы добавить первую
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default GoalsPage;
