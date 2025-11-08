# Complete Setup Guide - MostlyMyelinated

**From zero to deployed in under 30 minutes.**

This guide covers: PostgreSQL setup, backend, frontend, Railway deployment, and AI integration.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local PostgreSQL Setup](#2-local-postgresql-setup)
3. [Backend Setup](#3-backend-setup)
4. [Frontend Setup](#4-frontend-setup)
5. [Test Locally](#5-test-locally)
6. [Railway Deployment](#6-railway-deployment)
7. [AI Integration](#7-ai-integration)
8. [Production Checklist](#8-production-checklist)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

### Install Required Software

#### Node.js 18+
```bash
# Mac (using Homebrew)
brew install node@18

# Or using nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify:
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

#### PostgreSQL 14+
```bash
# Mac:
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Windows:
# Download from https://www.postgresql.org/download/windows/
# Run installer, keep default settings

# Verify:
psql --version  # Should show 14.x or higher
```

#### Git
```bash
# Mac:
brew install git

# Ubuntu:
sudo apt install git

# Windows:
# Download from https://git-scm.com/download/win

# Verify:
git --version
```

---

## 2. Local PostgreSQL Setup

### Step 1: Access PostgreSQL

```bash
# Mac/Linux - Access as default user:
psql postgres

# If that doesn't work, try:
sudo -u postgres psql

# Windows - Use pgAdmin or:
psql -U postgres
```

### Step 2: Create Database and User

```sql
-- In psql prompt:

-- Create database
CREATE DATABASE neuronode;

-- Create user with password
CREATE USER neurouser WITH PASSWORD 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE neuronode TO neurouser;

-- For PostgreSQL 15+, also run:
\c neuronode
GRANT ALL ON SCHEMA public TO neurouser;

-- Exit psql
\q
```

### Step 3: Test Connection

```bash
# Test if you can connect with new user:
psql -U neurouser -d neuronode -h localhost

# Enter password when prompted
# If successful, you'll see: neuronode=>

# Exit:
\q
```

**Troubleshooting PostgreSQL:**

```bash
# If connection fails, check if PostgreSQL is running:
# Mac:
brew services list

# Linux:
sudo systemctl status postgresql

# If not running, start it:
# Mac:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql
```

---

## 3. Backend Setup

### Step 1: Clone Repository (or navigate to existing)

```bash
cd MostlyMyelinated
```

### Step 2: Backend Dependencies

```bash
cd backend
npm install

# This installs:
# - Express, Prisma, PostgreSQL driver
# - TypeScript, ts-node, tsx
# - JWT, bcrypt
# - ts-fsrs (FSRS algorithm)
# - @anthropic-ai/sdk (for AI features)
```

### Step 3: Environment Variables

```bash
# Copy example file:
cp .env.example .env

# Edit .env:
nano .env
# Or use any text editor (VS Code, Sublime, etc.)
```

**Edit `.env` with your values:**

```bash
# Database connection
DATABASE_URL="postgresql://neurouser:secure_password_here@localhost:5432/neuronode?schema=public"

# JWT secret (generate a random string)
JWT_SECRET="your-random-32-character-secret-here"

# Environment
NODE_ENV="development"

# Port
PORT=3000

# AI (optional for now, add later)
ANTHROPIC_API_KEY=""
```

**Generate a secure JWT secret:**

```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 32

# Option 3: Use pwgen
pwgen -s 64 1

# Copy the output and use as JWT_SECRET
```

### Step 4: Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# You should see:
# ✅ Generated Prisma Client
# ✅ Database migrations have been created
#
# 📁 migrations/
#   └─ 20240101000000_init/
#      └─ migration.sql
```

**What this creates:**
- User table (authentication)
- Node table (knowledge hierarchy)
- Fact table (structured statements)
- Card table (flashcards with FSRS data)
- Review table (study history)
- NodeImage, FactImage tables

### Step 5: (Optional) View Database

```bash
# Open Prisma Studio:
npx prisma studio

# Opens at http://localhost:5555
# Browse tables, add test data, etc.
```

### Step 6: Start Backend

```bash
npm run dev

# You should see:
# 🧠 MostlyMyelinated API running on port 3000
# 📍 Health check: http://localhost:3000/health
# 📚 API docs: http://localhost:3000/
```

### Step 7: Test Backend

```bash
# In a new terminal:
curl http://localhost:3000/health

# Should return:
# {"status":"ok","timestamp":"2024-01-..."}

# Test API endpoints:
curl http://localhost:3000/

# Should return API documentation
```

---

## 4. Frontend Setup

### Step 1: Install Dependencies

```bash
# Open new terminal:
cd frontend
npm install

# This installs:
# - React 18, React Router
# - TypeScript
# - Vite (build tool)
# - Tailwind CSS
# - Axios (API client)
```

### Step 2: Environment Variables (optional)

```bash
# Copy example (optional, defaults work for local):
cp .env.example .env

# Edit if needed:
nano .env
```

**.env contents (only if you changed backend port):**
```bash
VITE_API_URL=http://localhost:3000/api
```

### Step 3: Start Frontend

```bash
npm run dev

# You should see:
# VITE v5.0.8  ready in 500 ms
#
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
# ➜  press h to show help
```

**Frontend is now running at: http://localhost:5173**

---

## 5. Test Locally

### Step 1: Open App

Open browser: **http://localhost:5173**

You should see the login page.

### Step 2: Create Account

1. Click "Don't have an account? Sign up"
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Sign Up"

You should be redirected to the Dashboard.

### Step 3: Create a Node

1. Click "Create Node"
2. Fill in:
   - Name: "Spinal Cord Anatomy"
   - Summary: "Basic anatomy of the spinal cord"
3. Click "Create"

### Step 4: Add a Fact

1. Click on your new node
2. In the "Quick Add" bar, type:
   ```
   Neural folds fuse dorsally → neural tube
   ```
3. Select type: "Association"
4. Click "Add Fact"

**You should see:**
- ✅ Fact created
- ✅ "3 cards generated" message
- Cards appear in the node

### Step 5: Study Cards

1. Go back to Dashboard (click "← Back")
2. You should see "Study (3 due)" button
3. Click "Study"
4. Review the flashcard
5. Click on card to flip
6. Rate it: Again / Hard / Good / Easy

### Step 6: Check NodeStrength

1. After reviewing, go back to Dashboard
2. Look at your node
3. Should see a colored badge (probably yellow/orange after first review)

**🎉 Success! The full stack is working.**

---

## 6. Railway Deployment

### Step 1: Install Railway CLI

```bash
# Mac/Linux:
curl -fsSL https://railway.app/install.sh | sh

# Or use npm:
npm install -g @railway/cli

# Windows (PowerShell):
iwr https://railway.app/install.ps1 | iex

# Verify:
railway --version
```

### Step 2: Login to Railway

```bash
railway login

# Opens browser for authentication
# Click "Authorize" in browser
# Terminal should show: "Logged in as <your-email>"
```

### Step 3: Create Railway Project

```bash
# From project root:
cd MostlyMyelinated

railway init

# Choose:
# ? Create new project or link to existing? Create new project
# ? What is your project name? MostlyMyelinated
# ? Environment: production

# You should see:
# ✅ Project created: MostlyMyelinated
```

### Step 4: Add PostgreSQL Database

```bash
railway add

# Select: PostgreSQL
# Railway provisions database automatically

# Wait for:
# ✅ PostgreSQL database provisioned
```

**Railway automatically sets `DATABASE_URL` environment variable.**

### Step 5: Set Environment Variables

```bash
# Generate production JWT secret:
openssl rand -hex 32

# Set variables:
railway variables set JWT_SECRET=<paste-generated-secret-here>
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Verify all variables are set:
railway variables

# Should show:
# DATABASE_URL (set by PostgreSQL service)
# JWT_SECRET
# NODE_ENV
# PORT
```

### Step 6: Deploy Backend

```bash
# Make sure you're on the correct branch:
git checkout claude/railway-stack-setup-011CUw29aeKVweUND5AcmqJm

# Push to Railway:
railway up

# Or use git:
git push railway claude/railway-stack-setup-011CUw29aeKVweUND5AcmqJm:main

# Deployment takes 2-5 minutes
# Watch logs:
railway logs
```

### Step 7: Run Database Migrations

```bash
# After deployment completes:
railway run npx prisma migrate deploy

# You should see:
# ✅ Migrations applied successfully

# Or run interactive shell:
railway shell
cd backend
npx prisma migrate deploy
exit
```

### Step 8: Get Your Backend URL

```bash
railway domain

# Shows:
# https://mostlymyelinated-production.up.railway.app
# (or similar)
```

### Step 9: Test Production Backend

```bash
# Replace with your actual URL:
curl https://your-app.up.railway.app/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

### Step 10: Deploy Frontend

**Option A: Separate Frontend Service (Recommended for scaling)**

```bash
# Create new service:
railway service create frontend

# Add environment variable:
railway variables set VITE_API_URL=https://your-backend-url.railway.app/api

# Deploy frontend:
# (Configure railway.json for frontend build)
```

**Option B: Serve Frontend from Backend (Simpler for MVP)**

```bash
# Build frontend:
cd frontend
npm run build

# Copy to backend public folder:
mkdir -p ../backend/public
cp -r dist/* ../backend/public/

# Update backend/src/index.ts to serve static files
# (See instructions below)

# Commit and redeploy:
cd ..
git add .
git commit -m "Add static frontend serving"
git push railway main
```

**Add to `backend/src/index.ts` (before errorHandler):**

```typescript
import path from 'path';

// Serve static files (frontend build)
app.use(express.static(path.join(__dirname, '../public')));

// Handle client-side routing (React Router)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});
```

### Step 11: Access Your Deployed App

```bash
# Get URL:
railway domain

# Open in browser:
# https://your-app.up.railway.app

# Create account and test!
```

---

## 7. AI Integration

### Step 1: Get Anthropic API Key

1. Go to: **https://console.anthropic.com**
2. Sign up / Login
3. Navigate to: **API Keys**
4. Click: **Create Key**
5. Name it: "MostlyMyelinated Production"
6. Copy the key (starts with `sk-ant-...`)

**⚠️ Important:** Copy the key now - you won't see it again!

### Step 2: Add API Key to Environment

**Local Development:**

```bash
cd backend
nano .env

# Add this line:
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# Save and exit
```

**Railway Production:**

```bash
railway variables set ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# Verify:
railway variables | grep ANTHROPIC
```

### Step 3: Install AI Dependencies

```bash
cd backend
npm install

# @anthropic-ai/sdk is already in package.json
# This installs it
```

### Step 4: Restart Services

**Local:**

```bash
# Stop backend (Ctrl+C) and restart:
npm run dev
```

**Railway:**

```bash
# Redeploy (automatically restarts):
railway up

# Or trigger redeploy in Railway dashboard
```

### Step 5: Test AI Features

**Using the UI:**

1. Navigate to any node
2. Find "AI Text Extractor" section
3. Paste this test text:
```
The cerebellum has three lobes: rostral, caudal, and flocculonodular.
It coordinates motor movements and maintains balance. Cerebellar damage
causes ataxia, characterized by uncoordinated movements and loss of balance.
```
4. Check "Automatically generate flashcards"
5. Click "Extract Facts with AI"
6. Wait 10-20 seconds
7. Should see: "AI extracted 2-3 facts and generated 6-12 cards!"

**Using curl:**

```bash
# Get your auth token (login first, check localStorage or Network tab)
TOKEN="your-token-here"
NODE_ID="your-node-id"

# Test fact extraction:
curl -X POST https://your-app.railway.app/api/ai/extract-facts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"nodeId\": \"$NODE_ID\",
    \"text\": \"The neural tube forms when neural folds fuse dorsally during neurulation.\"
  }"

# Should return extracted facts as JSON
```

### Step 6: Monitor AI Usage

1. Go to: **https://console.anthropic.com**
2. Navigate to: **Usage**
3. Monitor costs and requests
4. Set up billing alerts (recommended)

**Estimated costs:**
- Extract 1 page: ~$0.01-0.02
- Generate 5 cards: ~$0.005-0.01
- Typical user: ~$2-4/month

---

## 8. Production Checklist

Before going live, verify:

### Security

- [ ] JWT_SECRET is random and secure (32+ characters)
- [ ] DATABASE_URL uses strong password
- [ ] ANTHROPIC_API_KEY is kept secret
- [ ] `.env` is in `.gitignore`
- [ ] CORS is properly configured
- [ ] Rate limiting enabled (optional but recommended)

### Database

- [ ] All migrations applied successfully
- [ ] Database backups enabled (Railway automatic)
- [ ] Connection pooling configured (Prisma default is good)

### Backend

- [ ] Health check endpoint working: `/health`
- [ ] All API routes responding correctly
- [ ] Error handling working (try invalid requests)
- [ ] Logs are being captured (Railway automatic)

### Frontend

- [ ] Can create account and login
- [ ] Can create nodes
- [ ] Can add facts
- [ ] Can study cards
- [ ] NodeStrength updates after reviews
- [ ] AI features work (if enabled)

### Performance

- [ ] Database queries are optimized (Prisma handles this)
- [ ] Frontend bundle size reasonable (<500KB)
- [ ] API response times <200ms for common operations
- [ ] Image uploads work (if implemented)

### Monitoring

- [ ] Railway logs accessible
- [ ] Error tracking set up (Sentry optional)
- [ ] Uptime monitoring (Railway built-in)
- [ ] AI usage tracking (Anthropic Console)

---

## 9. Troubleshooting

### Database Connection Errors

**Error:** `Can't reach database server`

```bash
# Check if PostgreSQL is running:
# Mac:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql

# Restart if needed:
brew services restart postgresql@14
# or
sudo systemctl restart postgresql
```

**Error:** `Authentication failed`

```bash
# Verify DATABASE_URL format:
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE

# Check password doesn't have special characters that need escaping
# If it does, use URL encoding
```

**Error:** `relation "User" does not exist`

```bash
# Migrations weren't run. Run them:
cd backend
npx prisma migrate deploy

# Or reset database (WARNING: deletes data):
npx prisma migrate reset
```

### Backend Won't Start

**Error:** `Address already in use :3000`

```bash
# Find what's using port 3000:
lsof -i :3000

# Kill it:
kill -9 <PID>

# Or change PORT in .env to 3001
```

**Error:** `Cannot find module`

```bash
# Reinstall dependencies:
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Won't Start

**Error:** `Module not found`

```bash
# Reinstall dependencies:
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error:** `API calls failing (CORS error)`

Check backend CORS configuration:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-frontend-domain.com'
    : 'http://localhost:5173',
  credentials: true
}));
```

### Railway Deployment Errors

**Error:** `Build failed`

```bash
# Check Railway logs:
railway logs

# Common causes:
# - Missing dependencies in package.json
# - Build scripts failing
# - Environment variables not set

# Fix and redeploy:
git add .
git commit -m "Fix build"
git push railway main
```

**Error:** `Migrations failed`

```bash
# Run migrations manually:
railway run npx prisma migrate deploy

# Or reset database (WARNING: loses data):
railway run npx prisma migrate reset
```

### AI Features Not Working

**Error:** `Failed to extract facts`

```bash
# Check if API key is set:
railway variables | grep ANTHROPIC

# Test API key:
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"Hi"}]}'

# Should return Claude's response
# If 401: Invalid API key
# If 429: Rate limit exceeded
```

### General Debugging

**Enable verbose logging:**

```bash
# Backend (.env):
DEBUG=*

# Or specific modules:
DEBUG=express:*,prisma:*
```

**Check all services:**

```bash
# Backend:
curl http://localhost:3000/health

# Frontend:
curl http://localhost:5173

# Database:
psql -U neurouser -d neuronode -c "SELECT version();"

# Railway (production):
railway status
```

---

## Quick Reference

### Common Commands

```bash
# Backend
cd backend
npm run dev              # Start dev server
npm run build            # Build for production
npx prisma studio        # Database GUI
npx prisma migrate dev   # Create migration
npx prisma generate      # Regenerate client

# Frontend
cd frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Railway
railway login            # Login
railway status           # Check status
railway logs             # View logs
railway variables        # List environment variables
railway domain           # Get deployment URL
railway up               # Deploy
```

### Environment Variables Quick Reference

**Backend (.env):**
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="random-32-char-secret"
NODE_ENV="development|production"
PORT=3000
ANTHROPIC_API_KEY="sk-ant-..."
```

**Frontend (.env):**
```bash
VITE_API_URL="http://localhost:3000/api"
```

### Default Ports

- Backend API: `3000`
- Frontend Dev: `5173`
- PostgreSQL: `5432`
- Prisma Studio: `5555`

---

## Next Steps

1. **Read the AI_INTEGRATION_GUIDE.md** for advanced AI features
2. **Read the README.md** for architecture details
3. **Set up continuous deployment** with Railway GitHub integration
4. **Add custom domain** in Railway dashboard
5. **Enable HTTPS** (Railway provides this automatically)
6. **Set up monitoring** and alerts
7. **Implement rate limiting** for production
8. **Add image upload** for node images
9. **Implement PWA features** for mobile install

---

## Support

- **Issues:** Open GitHub issue with error logs
- **Docs:** README.md, AI_INTEGRATION_GUIDE.md
- **Railway:** https://docs.railway.app
- **Prisma:** https://www.prisma.io/docs
- **Anthropic:** https://docs.anthropic.com

---

**Built with:** PostgreSQL, Express, React, TypeScript, Railway, and Claude AI

**Setup time:** ~20-30 minutes from scratch

**You're ready to learn!** 🧠🎉
