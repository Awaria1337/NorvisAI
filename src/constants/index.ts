export const AI_MODELS = {
  OPENAI: {
    'gpt-4': 'GPT-4',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo'
  },
  ANTHROPIC: {
    'claude-3-opus': 'Claude 3 Opus',
    'claude-3-sonnet': 'Claude 3 Sonnet',
    'claude-3-haiku': 'Claude 3 Haiku'
  }
} as const;

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic'
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me'
  },
  CHAT: {
    LIST: '/api/chats',
    CREATE: '/api/chats',
    DELETE: '/api/chats',
    MESSAGES: '/api/chats/messages',
    SEND: '/api/chats/send'
  },
  USER: {
    PROFILE: '/api/user/profile',
    API_KEYS: '/api/user/api-keys'
  }
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CHAT: '/chat',
  PROFILE: '/profile',
  SETTINGS: '/settings'
} as const;