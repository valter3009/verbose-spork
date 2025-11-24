import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit2, Trash2, Save, X, Phone, Mail, Calendar, Heart } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const ContactsPage = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    birthday: '',
    notes: '',
    last_contact: '',
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: api.contacts.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.contacts.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Контакт создан успешно');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.contacts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Контакт обновлен');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.contacts.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Контакт удален');
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: '',
      birthday: '',
      notes: '',
      last_contact: '',
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

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name || '',
      phone: contact.phone || '',
      email: contact.email || '',
      relationship: contact.relationship || '',
      birthday: contact.birthday || '',
      notes: contact.notes || '',
      last_contact: contact.last_contact || '',
    });
    setIsCreating(true);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Контакты</h1>
            <p className="text-slate-400">Сохраняйте важные контакты</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gradient-button flex items-center gap-2"
        >
          {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreating ? 'Отмена' : 'Добавить контакт'}
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
                    Имя *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Введите имя..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Отношение
                  </label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Друг, Коллега, Семья..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    День рождения
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Последний контакт
                  </label>
                  <input
                    type="date"
                    value={formData.last_contact}
                    onChange={(e) => setFormData({ ...formData, last_contact: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Заметки
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Дополнительная информация..."
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

      {/* Contacts List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Загрузка...</div>
      ) : contacts && contacts.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              variants={item}
              className="glass-card-hover p-5"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {getInitials(contact.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
                    {contact.relationship && (
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {contact.relationship}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-sm text-slate-300 hover:text-purple-400 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-sm text-slate-300 hover:text-purple-400 transition-colors break-all"
                    >
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </a>
                  )}
                  {contact.birthday && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar className="w-4 h-4" />
                      День рождения: {new Date(contact.birthday).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                  {contact.last_contact && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      Последний контакт: {new Date(contact.last_contact).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>

                {contact.notes && (
                  <p className="text-sm text-slate-400 line-clamp-2">{contact.notes}</p>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Удалить этот контакт?')) {
                        deleteMutation.mutate(contact.id);
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
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">У вас пока нет контактов</p>
          <p className="text-slate-500 text-sm mt-2">
            Нажмите "Добавить контакт" чтобы добавить первый
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ContactsPage;
