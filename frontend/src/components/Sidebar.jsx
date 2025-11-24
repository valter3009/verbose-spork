import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageCircle,
  StickyNote,
  CheckSquare,
  Bell,
  Target,
  BookOpen,
  Users,
  Wallet,
  Activity,
  Phone,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/chat', icon: MessageCircle, label: 'Чат с AI' },
  { path: '/notes', icon: StickyNote, label: 'Заметки' },
  { path: '/tasks', icon: CheckSquare, label: 'Задачи' },
  { path: '/reminders', icon: Bell, label: 'Напоминания' },
  { path: '/goals', icon: Target, label: 'Цели' },
  { path: '/journal', icon: BookOpen, label: 'Дневник' },
  { path: '/contacts', icon: Users, label: 'Контакты' },
  { path: '/expenses', icon: Wallet, label: 'Расходы' },
  { path: '/habits', icon: Activity, label: 'Привычки' },
  { path: '/whatsapp', icon: Phone, label: 'WhatsApp', special: 'whatsapp' },
];

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/50">
        <h1 className="text-2xl font-bold gradient-text">AI Помощник</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isWhatsApp = item.special === 'whatsapp';

          return (
            <Link
              key={item.path}
              to={item.path}
              className={isActive ? 'sidebar-item-active' : 'sidebar-item'}
              onClick={() => setIsOpen(false)}
            >
              <Icon
                className={`w-5 h-5 ${isWhatsApp ? 'text-green-400' : ''}`}
              />
              <span className={isWhatsApp ? 'text-green-400' : ''}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <p className="text-xs text-slate-400 text-center">
          Powered by Claude AI
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-card-hover"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 glass-card border-r border-slate-800/50 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 glass-card border-r border-slate-800/50 z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
