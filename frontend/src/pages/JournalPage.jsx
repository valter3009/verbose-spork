import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Edit2, Trash2, Save, X, Smile, Zap, Heart } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const JournalPage = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    entry: '',
    mood: '',
    energy_level: 5,
  });

  const { data: journals, isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: api.journals.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.journals.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['journals']);
      toast.success('Запись в дневнике создана');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.journals.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['journals']);
      toast.success('Запись обновлена');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.journals.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['journals']);
      toast.success('Запись удалена');
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      entry: '',
      mood: '',
      energy_level: 5,
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

  const handleEdit = (journal) => {
    setEditingId(journal.id);
    setFormData({
      date: journal.date || '',
      entry: journal.entry || '',
      mood: journal.mood || '',
      energy_level: journal.energy_level || 5,
    });
    setIsCreating(true);
  };

  const moods = [
    { value: 'excellent', label: 'Отлично', emoji: '😄', color: 'text-green-400' },
    { value: 'good', label: 'Хорошо', emoji: '🙂', color: 'text-blue-400' },
    { value: 'okay', label: 'Нормально', emoji: '😐', color: 'text-yellow-400' },
    { value: 'bad', label: 'Плохо', emoji: '😟', color: 'text-orange-400' },
    { value: 'terrible', label: 'Ужасно', emoji: '😢', color: 'text-red-400' },
  ];

  const getMoodEmoji = (mood) => {
    const moodObj = moods.find(m => m.value === mood);
    return moodObj ? moodObj.emoji : '😐';
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Дневник</h1>
            <p className="text-slate-400">Записывайте свои мысли и эмоции</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gradient-button flex items-center gap-2"
        >
          {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreating ? 'Отмена' : 'Новая запись'}
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
                  Дата *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Smile className="w-4 h-4" />
                  Настроение
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood: mood.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.mood === mood.value
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-2xl text-center">{mood.emoji}</div>
                      <div className="text-xs text-center text-slate-400 mt-1">
                        {mood.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Уровень энергии: {formData.energy_level}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energy_level}
                  onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Низкий</span>
                  <span>Высокий</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Запись *
                </label>
                <textarea
                  value={formData.entry}
                  onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Что произошло сегодня? Как вы себя чувствуете?"
                />
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

      {/* Journal Entries List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Загрузка...</div>
      ) : journals && journals.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {journals.map((journal) => (
            <motion.div
              key={journal.id}
              variants={item}
              className="glass-card-hover p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getMoodEmoji(journal.mood)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {new Date(journal.date).toLocaleDateString('ru-RU', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {journal.mood && (
                          <span className="flex items-center gap-1">
                            <Smile className="w-3 h-3" />
                            {moods.find(m => m.value === journal.mood)?.label || journal.mood}
                          </span>
                        )}
                        {journal.energy_level && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Энергия: {journal.energy_level}/10
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap">{journal.entry}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(journal)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Удалить эту запись?')) {
                        deleteMutation.mutate(journal.id);
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
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">У вас пока нет записей</p>
          <p className="text-slate-500 text-sm mt-2">
            Нажмите "Новая запись" чтобы начать вести дневник
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default JournalPage;
