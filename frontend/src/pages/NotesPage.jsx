import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, Edit2, Trash2, Save, X, Tag, Star } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const NotesPage = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    is_important: false,
  });

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: api.notes.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.notes.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      toast.success('Заметка создана успешно');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.notes.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      toast.success('Заметка обновлена');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.notes.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      toast.success('Заметка удалена');
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({ title: '', content: '', category: '', tags: '', is_important: false });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setFormData({
      title: note.title || '',
      content: note.content || '',
      category: note.category || '',
      tags: note.tags?.join(', ') || '',
      is_important: note.is_important || false,
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
            <StickyNote className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Заметки</h1>
            <p className="text-slate-400">Сохраняйте важные мысли и идеи</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gradient-button flex items-center gap-2"
        >
          {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreating ? 'Отмена' : 'Создать заметку'}
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
                    Заголовок
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Введите заголовок..."
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
                    placeholder="Работа, Личное, Идеи..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Содержание *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Напишите вашу заметку..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="идея, важно, проект..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_important"
                  checked={formData.is_important}
                  onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800/50 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="is_important" className="text-sm text-slate-300 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Отметить как важное
                </label>
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

      {/* Notes List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Загрузка...</div>
      ) : notes && notes.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {notes.map((note) => (
            <motion.div key={note.id} variants={item} className="glass-card-hover p-5 relative">
              {note.is_important && (
                <Star className="absolute top-3 right-3 w-5 h-5 text-amber-400 fill-amber-400" />
              )}
              <div className="space-y-3">
                {note.title && (
                  <h3 className="text-lg font-semibold text-white pr-8">{note.title}</h3>
                )}
                <p className="text-slate-300 text-sm line-clamp-4">{note.content}</p>

                {note.category && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                    {note.category}
                  </div>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                  <span className="text-xs text-slate-500">
                    {new Date(note.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Удалить эту заметку?')) {
                          deleteMutation.mutate(note.id);
                        }
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
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
          <StickyNote className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">У вас пока нет заметок</p>
          <p className="text-slate-500 text-sm mt-2">
            Нажмите "Создать заметку" чтобы добавить первую
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default NotesPage;
