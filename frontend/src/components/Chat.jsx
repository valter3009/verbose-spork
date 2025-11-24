import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import MessageBubble from './MessageBubble';
import api from '../services/api';

const Chat = ({ conversationId: initialConversationId = null }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [currentToolCalls, setCurrentToolCalls] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Добавить сообщение пользователя
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      setStreamingMessage('');
      setCurrentToolCalls([]);
      let tempConversationId = conversationId;
      let assistantContent = '';
      const toolCalls = [];

      // Обработка streaming ответа
      await api.chat.sendMessage(tempConversationId, userMessage, (chunk) => {
        switch (chunk.type) {
          case 'conversation_id':
            tempConversationId = chunk.id;
            setConversationId(chunk.id);
            break;

          case 'text':
            assistantContent += chunk.text;
            setStreamingMessage((prev) => prev + chunk.text);
            break;

          case 'tool_start':
            toolCalls.push({
              id: chunk.tool.id,
              name: chunk.tool.name,
              input: {},
            });
            setCurrentToolCalls([...toolCalls]);
            break;

          case 'tool_input':
            // Обновить input последнего tool call
            if (toolCalls.length > 0) {
              try {
                toolCalls[toolCalls.length - 1].input = JSON.parse(chunk.input);
              } catch (e) {
                // Partial JSON, игнорируем
              }
              setCurrentToolCalls([...toolCalls]);
            }
            break;

          case 'tool_use_stop':
            // Tool calls завершены, выполнить их
            if (toolCalls.length > 0) {
              executeTools(tempConversationId, toolCalls);
            }
            break;

          case 'done':
            // Сохранить финальное сообщение
            if (assistantContent) {
              const assistantMessage = {
                role: 'assistant',
                content: assistantContent,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                timestamp: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, assistantMessage]);
            }
            setStreamingMessage('');
            setCurrentToolCalls([]);
            break;

          case 'error':
            toast.error('Ошибка: ' + chunk.error);
            break;
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Не удалось отправить сообщение');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const executeTools = async (convId, toolCalls) => {
    try {
      const response = await api.chat.executeTools(convId, toolCalls);

      // Добавить финальное сообщение после выполнения tools
      const finalMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, finalMessage]);
    } catch (error) {
      console.error('Error executing tools:', error);
      toast.error('Ошибка выполнения функций');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-card p-4 mb-4 border-b border-purple-500/20">
        <h2 className="text-xl font-bold gradient-text">Чат с AI-помощником</h2>
        <p className="text-slate-400 text-sm mt-1">
          Задавайте вопросы и управляйте своей жизнью через чат
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 mb-4">
        {messages.length === 0 && !streamingMessage && (
          <div className="text-center text-slate-400 mt-20">
            <p className="text-lg mb-2">Привет! Я твой личный AI-помощник 👋</p>
            <p className="text-sm">Напиши мне что-нибудь, чтобы начать...</p>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble key={index} {...message} />
        ))}

        {/* Streaming message */}
        {streamingMessage && (
          <MessageBubble
            role="assistant"
            content={streamingMessage}
            toolCalls={currentToolCalls}
          />
        )}

        {/* Loading indicator */}
        {loading && !streamingMessage && (
          <div className="flex items-center gap-2 text-purple-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI думает...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-card p-4 border-t border-purple-500/20">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            className="gradient-button h-12 w-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Нажмите Enter для отправки, Shift+Enter для новой строки
        </p>
      </div>
    </div>
  );
};

export default Chat;
