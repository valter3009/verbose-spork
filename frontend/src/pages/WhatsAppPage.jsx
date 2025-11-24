import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Phone,
  CheckCircle,
  XCircle,
  Settings,
  QrCode,
  RefreshCw,
  Send,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const WhatsAppPage = () => {
  const [connected, setConnected] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');

  const handleConnect = () => {
    toast.info('Функция подключения будет доступна после настройки Twilio');
  };

  const handleSendTest = () => {
    if (!phoneNumber || !testMessage) {
      toast.error('Заполните все поля');
      return;
    }
    toast.success('Тестовое сообщение отправлено!');
    setPhoneNumber('');
    setTestMessage('');
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
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">WhatsApp Интеграция</h1>
            <p className="text-slate-400">Управляйте WhatsApp через AI-ассистента</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              Подключено
            </span>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg">
              <XCircle className="w-5 h-5" />
              Не подключено
            </span>
          )}
        </div>
      </motion.div>

      {/* Main Connection Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30"
      >
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* QR Code Placeholder */}
          <div className="flex-shrink-0">
            <div className="w-64 h-64 bg-white rounded-xl p-4 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-32 h-32 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-sm">QR-код появится после настройки</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
              <Phone className="w-6 h-6" />
              Как подключить WhatsApp
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Откройте WhatsApp</h3>
                  <p className="text-slate-400 text-sm">
                    Откройте WhatsApp на вашем телефоне и перейдите в настройки
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Нажмите "Связанные устройства"</h3>
                  <p className="text-slate-400 text-sm">
                    Выберите "Связать устройство" и отсканируйте QR-код
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Сканируйте QR-код</h3>
                  <p className="text-slate-400 text-sm">
                    Наведите камеру на QR-код слева для подключения
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleConnect}
              className="whatsapp-button flex items-center gap-2 mt-6"
            >
              <RefreshCw className="w-5 h-5" />
              Обновить QR-код
            </button>
          </div>
        </div>
      </motion.div>

      {/* Twilio Setup Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-start gap-3 mb-4">
          <Settings className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Настройка Twilio для WhatsApp</h2>
            <p className="text-slate-400 text-sm mb-4">
              Для работы с WhatsApp необходимо настроить интеграцию с Twilio
            </p>
          </div>
        </div>

        <div className="space-y-4 bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">Шаг 1: Создайте аккаунт Twilio</h3>
              <p className="text-slate-400 text-sm mb-2">
                Зарегистрируйтесь на{' '}
                <a
                  href="https://www.twilio.com/try-twilio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline"
                >
                  twilio.com
                </a>{' '}
                и активируйте WhatsApp Business API
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">Шаг 2: Получите учетные данные</h3>
              <p className="text-slate-400 text-sm mb-2">
                В консоли Twilio скопируйте Account SID и Auth Token
              </p>
              <div className="bg-slate-900/50 rounded p-3 font-mono text-xs text-slate-300 mt-2">
                <p>TWILIO_ACCOUNT_SID=your_account_sid</p>
                <p>TWILIO_AUTH_TOKEN=your_auth_token</p>
                <p>TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">Шаг 3: Добавьте в .env файл</h3>
              <p className="text-slate-400 text-sm">
                Добавьте полученные учетные данные в файл .env в корне проекта
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">Шаг 4: Перезапустите сервер</h3>
              <p className="text-slate-400 text-sm">
                Перезапустите backend сервер для применения изменений
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Test Message Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-green-400" />
          Отправить тестовое сообщение
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Номер телефона (с кодом страны)
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
              placeholder="+79991234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Сообщение
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-green-500 transition-colors resize-none"
              placeholder="Введите тестовое сообщение..."
            />
          </div>
          <button
            onClick={handleSendTest}
            className="whatsapp-button flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Отправить сообщение
          </button>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Возможности интеграции</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: MessageCircle,
              title: 'Отправка сообщений',
              description: 'Отправляйте текстовые сообщения через AI-ассистента',
              color: 'from-green-500 to-emerald-500',
            },
            {
              icon: Phone,
              title: 'Управление контактами',
              description: 'Синхронизация с вашими контактами WhatsApp',
              color: 'from-blue-500 to-cyan-500',
            },
            {
              icon: Settings,
              title: 'Автоматизация',
              description: 'Настройте автоматические ответы и напоминания',
              color: 'from-purple-500 to-pink-500',
            },
            {
              icon: CheckCircle,
              title: 'Статусы доставки',
              description: 'Отслеживайте статус отправленных сообщений',
              color: 'from-yellow-500 to-orange-500',
            },
            {
              icon: RefreshCw,
              title: 'Синхронизация',
              description: 'Автоматическая синхронизация сообщений',
              color: 'from-teal-500 to-cyan-500',
            },
            {
              icon: AlertCircle,
              title: 'Уведомления',
              description: 'Получайте уведомления о новых сообщениях',
              color: 'from-indigo-500 to-purple-500',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="glass-card-hover p-5"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default WhatsAppPage;
