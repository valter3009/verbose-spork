const API_BASE = '/api';

// Generic fetch helper
const fetchAPI = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// CRUD operations for all entities
const createCRUDAPI = (endpoint) => ({
  getAll: () => fetchAPI(endpoint),
  getById: (id) => fetchAPI(`${endpoint}/${id}`),
  create: (data) => fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`${endpoint}/${id}`, { method: 'DELETE' }),
});

export const api = {
  notes: createCRUDAPI('/notes'),
  tasks: createCRUDAPI('/tasks'),
  reminders: createCRUDAPI('/reminders'),
  goals: createCRUDAPI('/goals'),
  journals: createCRUDAPI('/journals'),
  contacts: createCRUDAPI('/contacts'),
  expenses: createCRUDAPI('/expenses'),
  habits: createCRUDAPI('/habits'),
  memories: createCRUDAPI('/memories'),
  conversations: {
    getAll: () => fetchAPI('/conversations'),
    getById: (id) => fetchAPI(`/conversations/${id}`),
    create: (data) => fetchAPI('/conversations', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/conversations/${id}`, { method: 'DELETE' }),
  },
  dashboard: {
    getStats: () => fetchAPI('/dashboard/stats'),
  },
  chat: {
    sendMessage: async (conversationId, message, onChunk) => {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            onChunk(data);
          }
        }
      }
    },
    executeTools: (conversationId, toolCalls) =>
      fetchAPI('/chat/tools', {
        method: 'POST',
        body: JSON.stringify({ conversationId, toolCalls }),
      }),
  },
};

export default api;
