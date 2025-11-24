import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Plus, Edit2, Trash2, Save, X, Calendar, Flag } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const TasksPage = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    category: '',
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: api.tasks.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.tasks.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Задача создана успешно');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.tasks.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Задача обновлена');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.tasks.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Задача удалена');
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      category: '',
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

  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.due_date || '',
      category: task.category || '',
    });
    setIsCreating(true);
  };

  const toggleStatus = (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateMutation.mutate({ id: task.id, data: { status: newStatus } });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'low':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'text-green-400 bg-green-500/20';
      case 'in_progress':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Задачи</h1>
            <p className="text-slate-400">Управляйте своими делами эффективно</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gradient-button flex items-center gap-2"
        >
          {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreating ? 'Отмена' : 'Создать задачу'}
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
                    Название задачи *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Введите название..."
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
                    placeholder="Работа, Дом, Проект..."
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
                  placeholder="Добавьте детали..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="todo">К выполнению</option>
                    <option value="in_progress">В процессе</option>
                    <option value="done">Выполнено</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Приоритет
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Срок выполнения
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
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

      {/* Tasks List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Загрузка...</div>
      ) : tasks && tasks.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              variants={item}
              className="glass-card-hover p-5"
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleStatus(task)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.status === 'done'
                      ? 'bg-green-500 border-green-500'
                      : 'border-slate-600 hover:border-purple-500'
                  }`}
                >
                  {task.status === 'done' && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold ${
                          task.status === 'done'
                            ? 'line-through text-slate-500'
                            : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-slate-400 text-sm mt-1">{task.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                          {task.status === 'done' ? 'Выполнено' : task.status === 'in_progress' ? 'В процессе' : 'К выполнению'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                          <Flag className="w-3 h-3" />
                          {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </span>
                        {task.category && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                            {task.category}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Удалить эту задачу?')) {
                            deleteMutation.mutate(task.id);
                          }
                        }}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
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
          <CheckSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">У вас пока нет задач</p>
          <p className="text-slate-500 text-sm mt-2">
            Нажмите "Создать задачу" чтобы добавить первую
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TasksPage;
