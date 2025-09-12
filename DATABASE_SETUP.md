# Database Setup Guide

## PostgreSQL Setup

### Option 1: Local PostgreSQL Installation

1. **Install PostgreSQL**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Create Database**
   ```sql
   -- Connect to PostgreSQL as superuser
   psql -U postgres
   
   -- Create database
   CREATE DATABASE norvis_ai;
   
   -- Create user (optional)
   CREATE USER norvis_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE norvis_ai TO norvis_user;
   ```

3. **Update .env file**
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/norvis_ai?schema=public"
   ```

### Option 2: Docker PostgreSQL (Recommended for Development)

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: norvis_ai
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password123
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

2. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

3. **Update .env file**
   ```env
   DATABASE_URL="postgresql://postgres:password123@localhost:5432/norvis_ai?schema=public"
   ```

### Option 3: Cloud Database (Production)

Use services like:
- **Supabase** (Free tier available)
- **Railway** (Free tier available)
- **PlanetScale** (MySQL alternative)
- **Neon** (Serverless PostgreSQL)

## Environment Variables Setup

Update your `.env` file with these values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/norvis_ai?schema=public"

# JWT (Generate secure keys for production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRE="7d"

# Encryption for API keys (32 characters)
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

## Database Migration

After setting up PostgreSQL:

1. **Run migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Generate Prisma client** (if not done already)
   ```bash
   npx prisma generate
   ```

3. **View database** (optional)
   ```bash
   npx prisma studio
   ```

## Verification

Test your database connection by running the development server:

```bash
npm run dev
```

Then try to register a new user at http://localhost:3000/auth/register

## Troubleshooting

### Common Issues:

1. **Connection refused**
   - Make sure PostgreSQL is running
   - Check the DATABASE_URL format
   - Verify port 5432 is not blocked

2. **Authentication failed**
   - Check username/password in DATABASE_URL
   - Ensure user has proper permissions

3. **Database doesn't exist**
   - Create the database manually: `CREATE DATABASE norvis_ai;`

4. **Migration errors**
   - Reset database: `npx prisma migrate reset`
   - Then run: `npx prisma migrate dev --name init`