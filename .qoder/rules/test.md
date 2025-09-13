---
trigger: always_on
alwaysApply: true
---
# AI Chat Uygulaması - Project Rules ve Development Guidelines

## 1. Genel Geliştirme Kuralları

### 1.1 Kod Kalitesi Standartları
- **Clean Code Prensipleri**: Her fonksiyon tek bir işi yapmalı ve anlaşılır olmalı
- **SOLID Prensipleri**: Özellikle Single Responsibility ve Dependency Inversion
- **DRY (Don't Repeat Yourself)**: Kod tekrarından kaçın
- **KISS (Keep It Simple, Stupid)**: Gereksiz karmaşıklıktan kaçın
- **Consistent Naming**: İngilizce ve tutarlı isimlendirme

### 1.2 Kod Formatlaması
```javascript
// ✅ Doğru kullanım
const getUserMessages = async (userId, limit = 10) => {
  try {
    const messages = await Message.findByUserId(userId, limit);
    return {
      success: true,
      data: messages
    };
  } catch (error) {
    logger.error('Failed to fetch user messages', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ❌ Yanlış kullanım
function get_user_msgs(id, lmt) {
  var msgs = Message.find(id, lmt);
  return msgs;
}
```

## 2. Frontend Development Rules

### 2.1 React Component Yapısı
```jsx
// ✅ Functional Component Template
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2, ...rest }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  const handleFunction = (params) => {
    // Event handlers
  };

  return (
    <div className="component-wrapper" {...rest}>
      {/* Component content */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

ComponentName.defaultProps = {
  prop2: 0
};

export default ComponentName;
```

### 2.2 Klasör Yapısı
```
src/
├── components/           # Reusable components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   ├── chat/            # Chat specific components
│   └── auth/            # Authentication components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API services
├── utils/               # Utility functions
├── store/               # State management
├── styles/              # Global styles
├── assets/              # Static assets
└── constants/           # App constants
```

### 2.3 State Management Rules
```javascript
// ✅ Zustand Store Example
import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  // State
  messages: [],
  currentChat: null,
  isLoading: false,
  
  // Actions
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearMessages: () => set({ messages: [] })
}));
```

### 2.4 CSS/Tailwind Kuralları
- **Utility-first approach**: Tailwind sınıflarını kullan
- **Custom CSS minimumu**: Sadece gerekli durumlarda
- **Responsive design**: Mobile-first yaklaşım
- **Dark mode support**: `dark:` prefix kullan

```jsx
// ✅ Tailwind kullanımı
<div className="flex flex-col h-screen bg-white dark:bg-gray-900">
  <header className="sticky top-0 z-10 bg-blue-600 text-white p-4">
    <h1 className="text-xl font-semibold">Chat A.I+</h1>
  </header>
  <main className="flex-1 overflow-hidden">
    {/* Content */}
  </main>
</div>
```

## 3. Backend Development Rules

### 3.1 Express.js Yapısı
```javascript
// ✅ Route Handler Template
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user chats
// @route   GET /api/v1/chats
// @access  Private
exports.getChats = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id;

  const chats = await Chat.findByUserId(userId, {
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.status(200).json({
    success: true,
    count: chats.length,
    data: chats
  });
});
```

### 3.2 Error Handling
```javascript
// ✅ Global Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

## 4. Güvenlik Kuralları

### 4.1 Authentication & Authorization
```javascript
// ✅ JWT Middleware
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});
```

### 4.2 API Key Güvenliği
```javascript
// ✅ API Key Encryption
const crypto = require('crypto');

class EncryptionService {
  static encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    
    const decipher = crypto.createDecipher(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 4.3 Input Validation
```javascript
// ✅ Joi Validation
const Joi = require('joi');

const chatValidation = {
  createChat: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    aiModel: Joi.string().valid('gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2').required()
  }),

  sendMessage: Joi.object({
    content: Joi.string().min(1).max(10000).required(),
    chatId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  })
};

// Middleware kullanımı
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};
```

## 5. API Integration Rules

### 5.1 AI Provider Service
```javascript
// ✅ AI Service Pattern
class AIService {
  constructor(provider, apiKey) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.client = this.initializeClient();
  }

  initializeClient() {
    switch (this.provider) {
      case 'openai':
        return new OpenAI({ apiKey: this.apiKey });
      case 'anthropic':
        return new Anthropic({ apiKey: this.apiKey });
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  async sendMessage(messages, model, options = {}) {
    try {
      const response = await this.generateResponse(messages, model, options);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      logger.error(`AI Service Error (${this.provider}):`, error);
      return {
        success: false,
        error: this.handleProviderError(error)
      };
    }
  }

  handleProviderError(error) {
    // Provider specific error handling
    if (error.status === 429) {
      return 'Rate limit exceeded. Please try again later.';
    }
    if (error.status === 401) {
      return 'Invalid API key. Please check your configuration.';
    }
    return 'AI service temporarily unavailable.';
  }
}
```

## 6. Testing Rules

### 6.1 Unit Test Template
```javascript
// ✅ Jest Test Example
describe('ChatService', () => {
  let chatService;
  
  beforeEach(() => {
    chatService = new ChatService();
  });

  describe('createChat', () => {
    it('should create a new chat successfully', async () => {
      // Arrange
      const userId = 'user123';
      const chatData = { title: 'Test Chat', aiModel: 'gpt-4' };
      
      // Act
      const result = await chatService.createChat(userId, chatData);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Test Chat');
      expect(result.data.userId).toBe(userId);
    });

    it('should return error for invalid data', async () => {
      // Arrange
      const userId = 'user123';
      const invalidData = { title: '' }; // Missing required fields
      
      // Act
      const result = await chatService.createChat(userId, invalidData);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
```

## 7. Performance Rules

### 7.1 Database Optimization
```javascript
// ✅ Efficient Queries
// Bad - N+1 query problem
const chats = await Chat.find({ userId });
for (const chat of chats) {
  chat.messages = await Message.find({ chatId: chat._id });
}

// Good - Use populate or aggregation
const chats = await Chat.find({ userId }).populate({
  path: 'messages',
  options: { limit: 20, sort: { createdAt: -1 } }
});
```

### 7.2 Caching Strategy
```javascript
// ✅ Redis Caching
const redis = require('redis');
const client = redis.createClient();

class CacheService {
  static async get(key) {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key, data, ttl = 3600) {
    try {
      await client.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }
}
```

## 8. Deployment Rules

### 8.1 Environment Configuration
```javascript
// ✅ Environment Variables
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  // Database
  DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/chatai',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  
  // External APIs
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'ENCRYPTION_KEY'];
for (const envVar of requiredEnvVars) {
  if (!config[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

### 8.2 Docker Configuration
```dockerfile
# ✅ Production Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership and switch to non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
```

## 9. Monitoring ve Logging

### 9.1 Logging Strategy
```javascript
// ✅ Winston Logger Configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'chat-ai-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

## 10. Yasaklanan Practices

### 10.1 Asla Yapılmaması Gerekenler
```javascript
// ❌ Güvenlik açıkları
app.get('/user/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  // SQL Injection riski!
});

// ❌ Hardcoded secrets
const API_KEY = "sk-1234567890abcdef"; // Asla böyle yapma!

// ❌ Poor error handling
app.get('/chats', async (req, res) => {
  const chats = await Chat.find(); // Error handling yok!
  res.json(chats);
});

// ❌ Blocking operations
app.get('/heavy-task', (req, res) => {
  for (let i = 0; i < 10000000; i++) {
    // Event loop'u bloke eder!
  }
  res.json({ done: true });
});

// ❌ Memory leaks
let globalData = [];
app.post('/data', (req, res) => {
  globalData.push(req.body); // Memory leak riski!
  res.json({ ok: true });
});
```

### 10.2 Code Review Checklist
- [ ] Error handling uygun mu?
- [ ] Input validation var mı?
- [ ] SQL injection riski var mı?
- [ ] Sensitive data log'lanıyor mu?
- [ ] Memory leak riski var mı?
- [ ] Performance optimizasyonu yapılmış mı?
- [ ] Tests yazılmış mı?
- [ ] Documentation güncel mi?

Bu kurallar ve standartlar takip edilerek, temiz, güvenli ve ölçeklenebilir bir AI chat uygulaması geliştirebiliriz.