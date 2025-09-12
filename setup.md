# 🚀 Norvis AI - Quick Setup Guide

## Step 1: Database Setup (Choose One)

### Option A: Docker (Recommended - Easiest)
```bash
# Start PostgreSQL with Docker
npm run db:setup
```

### Option B: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create database: `CREATE DATABASE norvis_ai;`
3. Update DATABASE_URL in .env file

## Step 2: Run Database Migrations
```bash
# If you didn't use the db:setup command above
npx prisma migrate dev --name init
```

## Step 3: Start the Application
```bash
npm run dev
```

## Step 4: Test the Application
1. Open http://localhost:3000 (or the port shown in terminal)
2. Click "Sign up" to create a new account
3. Fill in your details and register
4. You should be redirected to the chat interface

## 🎉 You're Ready!

Your Norvis AI application is now running with:
- ✅ PostgreSQL database
- ✅ User authentication
- ✅ Modern UI with dark mode
- ✅ Responsive design

## Next Steps
- Configure AI provider API keys
- Start chatting with AI models
- Customize the interface

## Useful Commands
```bash
npm run db:studio    # View database in browser
npm run db:reset     # Reset database (careful!)
npm run dev          # Start development server
```

## Need Help?
Check the DATABASE_SETUP.md file for detailed database setup instructions.