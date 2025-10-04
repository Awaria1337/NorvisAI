# Norvis AI - Multi-Modal AI Chat Platform

A modern, professional chat application that allows users to connect with multiple AI providers (OpenAI, Anthropic, etc.) using their own API keys.

## 🚀 Features

### Phase 1 - Core Features (Current)
- ✅ User Authentication (Register/Login)
- ✅ **Email Verification System**
- ✅ **Password Reset Flow**
- ✅ **Professional Email Templates**
- ✅ Modern UI with Tailwind CSS
- ✅ Responsive Design with Dark Mode Support
- ✅ State Management with Zustand
- ✅ TypeScript Support
- ✅ Chat Interface
- ✅ API Key Management
- ✅ Multiple AI Provider Support

### Phase 2 - Advanced Features (Planned)
- 📁 File Upload Support
- 🎨 Image Generation
- 🎤 Voice Commands
- 💰 Premium Plans
- 📊 Usage Analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Database**: PostgreSQL (Planned)
- **Authentication**: JWT (Planned)

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   ├── chat/           # Chat interface
│   └── globals.css     # Global styles
├── components/         # Reusable components
│   └── ui/            # Basic UI components
├── store/             # Zustand stores
├── utils/             # Utility functions
├── constants/         # App constants
└── types/             # TypeScript types
```

## 🚦 Getting Started

### Quick Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   - Database URL (PostgreSQL)
   - SMTP settings for email (see `QUICK_SMTP_GUIDE.md`)
   - JWT secret
   - Optional: AI API keys

3. **Set up database**
   ```bash
   npm run db:migrate
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 📧 Email System Setup

For email verification and password reset features:

**Quick Start (5 minutes):**
- 🇬🇧 English: See `QUICK_SMTP_GUIDE.md` for fast setup
- 🇹🇷 Türkçe: `HIZLI_SMTP_KURULUM.md` dosyasına bakın

**Detailed Guide:**
- 🇬🇧 English: See `GMAIL_SMTP_SETUP.md` for complete instructions
- 🇹🇷 Türkçe: `GMAIL_SMTP_KURULUM.md` dosyasına bakın
- 📚 Technical Docs: `EMAIL_SETUP_GUIDE.md` for full documentation

## 🔧 Development Guidelines

This project follows strict development rules outlined in `project-rules.md`:

- **Clean Code**: SOLID principles, DRY, KISS
- **TypeScript**: Strict typing throughout
- **Component Structure**: Functional components with proper prop types
- **State Management**: Zustand for global state
- **Styling**: Tailwind CSS utility-first approach
- **Error Handling**: Comprehensive error boundaries and validation
- **Security**: Input validation, secure authentication

## 📋 Current Status

### ✅ Completed
- Project setup with Next.js 15 and TypeScript
- Authentication UI (Login/Register pages)
- Basic chat interface layout
- State management setup
- UI component library (Button, Input)
- Responsive design with dark mode

### 🔄 In Progress
- Database integration
- API endpoints for authentication
- Chat functionality
- AI provider integrations

### 📝 Next Steps
1. Set up PostgreSQL database with Prisma
2. Implement authentication API endpoints
3. Create API key management system
4. Integrate OpenAI and Anthropic APIs
5. Add real-time chat functionality
6. Implement message history

## 🎨 Design System

- **Primary Color**: Blue (#4F46E5)
- **Secondary Color**: Gray (#6B7280)
- **Accent Color**: Green (#10B981)
- **Typography**: Inter font family
- **Components**: Consistent spacing, rounded corners, subtle shadows

## 🔐 Security Features

- JWT token authentication
- API key encryption (AES-256)
- Input validation with Joi
- Rate limiting
- HTTPS enforcement
- Secure password hashing

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface
- Optimized for all screen sizes
