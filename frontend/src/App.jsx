import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import NotesPage from './pages/NotesPage';
import TasksPage from './pages/TasksPage';
import RemindersPage from './pages/RemindersPage';
import GoalsPage from './pages/GoalsPage';
import JournalPage from './pages/JournalPage';
import ContactsPage from './pages/ContactsPage';
import ExpensesPage from './pages/ExpensesPage';
import HabitsPage from './pages/HabitsPage';
import WhatsAppPage from './pages/WhatsAppPage';

function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/whatsapp" element={<WhatsAppPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
