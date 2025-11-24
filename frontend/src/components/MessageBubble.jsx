import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp, User, Bot } from 'lucide-react';

const MessageBubble = ({ role, content, toolCalls }) => {
  const isUser = role === 'user';
  const [copiedCode, setCopiedCode] = useState(null);
  const [expandedTools, setExpandedTools] = useState({});

  const copyToClipboard = async (code, index) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleTool = (index) => {
    setExpandedTools(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
            : 'bg-slate-800 border border-slate-700'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5 text-purple-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`inline-block p-4 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'glass-card'
          }`}
        >
          {/* Message Text */}
          <div className={`markdown ${isUser ? 'text-white' : 'text-slate-100'}`}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const language = match ? match[1] : '';

                  if (!inline && match) {
                    return (
                      <div className="relative group my-4">
                        <button
                          onClick={() => copyToClipboard(codeString, codeString)}
                          className="absolute top-2 right-2 p-2 glass-card-hover opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          title="Копировать код"
                        >
                          {copiedCode === codeString ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={language}
                          PreTag="div"
                          className="rounded-lg"
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Tool Calls */}
          {toolCalls && toolCalls.length > 0 && (
            <div className="mt-4 space-y-2">
              {toolCalls.map((tool, index) => (
                <div
                  key={index}
                  className="glass-card border border-slate-700/50 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleTool(index)}
                    className="w-full p-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-purple-400">
                        {tool.function.name}
                      </span>
                    </div>
                    {expandedTools[index] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedTools[index] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-700/50"
                    >
                      <div className="p-3">
                        <p className="text-xs text-slate-400 mb-2">Параметры:</p>
                        <pre className="text-xs bg-slate-900/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(JSON.parse(tool.function.arguments), null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className={`text-xs text-slate-500 mt-1 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
