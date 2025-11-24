import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, Edit2, Trash2, Save, X, Calendar, CreditCard, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const ExpensesPage = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'RUB',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: '',
    is_recurring: false,
  });

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: api.expenses.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.expenses.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('Расход добавлен успешно');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.expenses.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('Расход обновлен');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.expenses.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('Расход удален');
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      amount: '',
      currency: 'RUB',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      payment_method: '',
      is_recurring: false,
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setFormData({
      amount: expense.amount?.toString() || '',
      currency: expense.currency || 'RUB',
      category: expense.category || '',
      description: expense.description || '',
      date: expense.date || '',
      payment_method: expense.payment_method || '',
      is_recurring: expense.is_recurring || false,
    });
    setIsCreating(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Еда': 'bg-orange-500/20 text-orange-300',
      'Транспорт': 'bg-blue-500/20 text-blue-300',
      'Развлечения': 'bg-pink-500/20 text-pink-300',
      'Здоровье': 'bg-green-500/20 text-green-300',
      'Жилье': 'bg-purple-500/20 text-purple-300',
      'Образование': 'bg-indigo-500/20 text-indigo-300',
    };
    return colors[category] || 'bg-slate-500/20 text-slate-300';
  };

  const getTotalByMonth = () => {
    if (!expenses) return 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Расходы</h1>
            <p className="text-slate-400">Контролируйте свои финансы</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="gradient-button flex items-center gap-2"
        >
          {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreating ? 'Отмена' : 'Добавить расход'}
        </button>
      </motion.div>

      {/* Monthly Total */}
      {expenses && expenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6"
        >
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Расходы за текущий месяц</p>
            <p className="text-4xl font-bold gradient-text">
              {getTotalByMonth().toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </motion.div>
      )}

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Сумма *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Валюта
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="RUB">RUB ₽</option>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                  </select>
                </div>
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Категория *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Еда, Транспорт, Развлечения..."
                    list="categories"
                  />
                  <datalist id="categories">
                    <option value="Еда" />
                    <option value="Транспорт" />
                    <option value="Развлечения" />
                    <option value="Здоровье" />
                    <option value="Жилье" />
                    <option value="Образование" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Способ оплаты
                  </label>
                  <input
                    type="text"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Наличные, Карта..."
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
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Дополнительная информация..."
                />
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
                  Регулярный платеж
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

      {/* Expenses List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Загрузка...</div>
      ) : expenses && expenses.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {expenses.map((expense) => (
            <motion.div
              key={expense.id}
              variants={item}
              className="glass-card-hover p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {expense.amount.toLocaleString('ru-RU')} {expense.currency === 'RUB' ? '₽' : expense.currency === 'USD' ? '$' : '€'}
                      </h3>
                      {expense.description && (
                        <p className="text-sm text-slate-400">{expense.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(expense.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                    {expense.payment_method && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs">
                        <CreditCard className="w-3 h-3" />
                        {expense.payment_method}
                      </span>
                    )}
                    {expense.is_recurring && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                        <Repeat className="w-3 h-3" />
                        Регулярный
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Удалить этот расход?')) {
                        deleteMutation.mutate(expense.id);
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
          <DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">У вас пока нет расходов</p>
          <p className="text-slate-500 text-sm mt-2">
            Нажмите "Добавить расход" чтобы начать отслеживать траты
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ExpensesPage;
