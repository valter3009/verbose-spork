import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Bell,
  Target,
  Activity,
  Phone,
  TrendingUp,
  Clock,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: api.dashboard.getStats,
  });

  // Fetch tasks
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: api.tasks.getAll,
  });

  // Fetch reminders
  const { data: reminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: api.reminders.getAll,
  });

  // Fetch goals
  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: api.goals.getAll,
  });

  const statCards = [
    {
      title: 'Активные задачи',
      value: stats?.activeTasks || 0,
      icon: CheckSquare,
      color: 'from-blue-500 to-cyan-500',
      link: '/tasks',
    },
    {
      title: 'Напоминания',
      value: stats?.upcomingReminders || 0,
      icon: Bell,
      color: 'from-yellow-500 to-orange-500',
      link: '/reminders',
    },
    {
      title: 'Активные цели',
      value: stats?.activeGoals || 0,
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      link: '/goals',
    },
    {
      title: 'Привычки',
      value: stats?.activeHabits || 0,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      link: '/habits',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
        className="mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Добро пожаловать!
        </h1>
        <p className="text-slate-400">
          Вот ваш обзор на сегодня
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={item}>
              <Link to={stat.link}>
                <div className="glass-card-hover p-6 cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <h3 className="text-slate-400 text-sm mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold">
                    {statsLoading ? '...' : stat.value}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* WhatsApp Card - Large */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link to="/whatsapp">
          <div className="glass-card-hover p-8 cursor-pointer bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500/50 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-400 mb-2">
                    WhatsApp Интеграция
                  </h2>
                  <p className="text-slate-300">
                    Управляйте своим ботом WhatsApp и отправляйте сообщения
                  </p>
                </div>
              </div>
              <button className="whatsapp-button group-hover:scale-105 transition-transform">
                Открыть
              </button>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-400" />
              Ближайшие задачи
            </h2>
            <Link to="/tasks" className="text-purple-400 hover:text-purple-300 text-sm">
              Все задачи →
            </Link>
          </div>
          <div className="space-y-3">
            {tasks && tasks.length > 0 ? (
              tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-3 glass-card-hover flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`} />
                    <p className="text-sm">{task.title}</p>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-8">
                У вас нет активных задач
              </p>
            )}
          </div>
        </motion.div>

        {/* Upcoming Reminders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Ближайшие напоминания
            </h2>
            <Link to="/reminders" className="text-purple-400 hover:text-purple-300 text-sm">
              Все напоминания →
            </Link>
          </div>
          <div className="space-y-3">
            {reminders && reminders.length > 0 ? (
              reminders.slice(0, 5).map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-3 glass-card-hover flex items-center justify-between"
                >
                  <p className="text-sm">{reminder.title}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(reminder.time).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-8">
                У вас нет активных напоминаний
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Active Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Активные цели
          </h2>
          <Link to="/goals" className="text-purple-400 hover:text-purple-300 text-sm">
            Все цели →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals && goals.length > 0 ? (
            goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="glass-card-hover p-4">
                <h3 className="font-semibold mb-2">{goal.title}</h3>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Прогресс</span>
                    <span>{goal.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress || 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    />
                  </div>
                </div>
                {goal.deadline && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    Дедлайн: {new Date(goal.deadline).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <p className="text-slate-400 text-center py-8">
                У вас нет активных целей
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
