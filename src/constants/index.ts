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
  },
  GOOGLE: {
    'gemini-pro': 'Gemini Pro',
    'gemini-pro-vision': 'Gemini Pro Vision'
  },
  OPENROUTER: {
    'deepseek/deepseek-chat': 'DeepSeek Chat v3.1',
    'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
    'openai/gpt-4': 'GPT-4',
    'meta-llama/llama-3.1-405b-instruct': 'Llama 3.1 405B'
  },
  DEEPSEEK: {
    'deepseek-chat': 'DeepSeek Chat',
    'deepseek-coder': 'DeepSeek Coder'
  },
  MISTRAL: {
    'mistral-large': 'Mistral Large',
    'mistral-medium': 'Mistral Medium',
    'mistral-small': 'Mistral Small'
  },
  COHERE: {
    'command': 'Command',
    'command-light': 'Command Light'
  },
  PERPLEXITY: {
    'pplx-7b-online': 'Perplexity 7B Online',
    'pplx-70b-online': 'Perplexity 70B Online'
  }
} as const;

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  OPENROUTER: 'openrouter',
  DEEPSEEK: 'deepseek',
  MISTRAL: 'mistral',
  COHERE: 'cohere',
  PERPLEXITY: 'perplexity'
} as const;

export const AI_PROVIDER_LABELS = {
  [AI_PROVIDERS.OPENAI]: 'OpenAI',
  [AI_PROVIDERS.ANTHROPIC]: 'Anthropic',
  [AI_PROVIDERS.GOOGLE]: 'Google',
  [AI_PROVIDERS.OPENROUTER]: 'OpenRouter',
  [AI_PROVIDERS.DEEPSEEK]: 'DeepSeek',
  [AI_PROVIDERS.MISTRAL]: 'Mistral AI',
  [AI_PROVIDERS.COHERE]: 'Cohere',
  [AI_PROVIDERS.PERPLEXITY]: 'Perplexity'
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