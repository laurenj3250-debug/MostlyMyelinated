# MostlyMyelinated Deployment Guide

## Prerequisites

- Railway account (or any PaaS that supports Node.js + PostgreSQL)
- PostgreSQL database
- Anthropic API key (for AI features)

## Environment Variables

Set the following environment variables in your Railway project:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long

# Server
NODE_ENV=production
PORT=3000

# AI Features
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

## Railway Deployment

### Automatic Deployment (Recommended)

1. **Connect Repository**
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub"
   - Select your MostlyMyelinated repository

2. **Add PostgreSQL**
   - In your project, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

3. **Set Environment Variables**
   - Go to project settings → Variables
   - Add all required environment variables listed above

4. **Deploy**
   - Railway will automatically build and deploy using `railway.json`
   - The build process:
     1. Builds frontend (React + Vite)
     2. Copies frontend build to backend/public
     3. Installs backend dependencies
     4. Generates Prisma client
     5. Builds backend TypeScript
   - On start, runs `prisma migrate deploy` then `npm start`

### Manual Build (Local Testing)

```bash
# Install all dependencies
npm run install:all

# Generate Prisma client
cd backend && npx prisma generate

# Build frontend
cd ../frontend && npm run build

# Copy frontend build to backend
mkdir -p ../backend/public
cp -r dist/* ../backend/public/

# Build backend
cd ../backend && npm run build

# Run migrations
npx prisma migrate deploy

# Start server
npm start
```

## Database Migrations

### Development
```bash
cd backend
npx prisma migrate dev --name description_of_changes
```

### Production
Migrations are automatically run on Railway deployment via `railway.json`:
```bash
npx prisma migrate deploy
```

## Post-Deployment Checklist

- [ ] Database is connected and migrations ran successfully
- [ ] Environment variables are set correctly
- [ ] JWT_SECRET is a strong, random string (at least 32 characters)
- [ ] Health check endpoint works: `https://your-app.railway.app/health`
- [ ] API endpoint works: `https://your-app.railway.app/api`
- [ ] Can create a user account
- [ ] Can log in
- [ ] PWA manifest is accessible: `https://your-app.railway.app/manifest.json`
- [ ] Service worker registers (check browser console)
- [ ] Mobile view is responsive
- [ ] Image upload works
- [ ] Image annotation works
- [ ] Card preview/edit works
- [ ] Study session works
- [ ] FSRS scheduling works correctly

## Testing the Deployment

### 1. Health Check
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-..."}
```

### 2. Register a Test User
```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

### 3. Create a Node
Use the web interface or API to test full functionality

## Troubleshooting

### Build Failures

**Error**: `Cannot find module '@prisma/client'`
- **Fix**: Ensure `npx prisma generate` runs before `npm run build`

**Error**: `ENOENT: no such file or directory '../backend/public'`
- **Fix**: The build command creates this directory, ensure build order is correct

### Runtime Errors

**Error**: `Invalid DATABASE_URL`
- **Fix**: Check PostgreSQL connection string format in environment variables

**Error**: `JWT must be provided`
- **Fix**: Ensure JWT_SECRET environment variable is set

**Error**: `Service worker registration failed`
- **Fix**: Check that service-worker.js is in the public directory and served correctly

### Database Issues

**Error**: `P3009: migrate found failed migrations`
- **Fix**: Roll back failed migrations or reset database
```bash
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate deploy
```

## Monitoring

### Logs
View logs in Railway dashboard or via CLI:
```bash
railway logs
```

### Database
Access via Railway dashboard PostgreSQL plugin or:
```bash
npx prisma studio
```

## Scaling Considerations

### Current Setup (MVP)
- Single server instance
- Images stored in PostgreSQL as bytes (max 10MB per image)
- No CDN

### Future Improvements
1. **Image Storage**: Move to S3/R2/Cloud Storage for better performance
2. **Caching**: Add Redis for session management and caching
3. **CDN**: Serve static assets via CDN
4. **Database**:
   - Enable connection pooling
   - Add read replicas for scaling
5. **Background Jobs**: Queue system for AI processing
6. **Monitoring**: Add error tracking (Sentry) and analytics

## Security Checklist

- [ ] JWT_SECRET is strong and unique (not the example value)
- [ ] DATABASE_URL contains strong password
- [ ] CORS is configured for production domain only (if needed)
- [ ] Rate limiting is in place (consider adding)
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection (React handles this)
- [ ] HTTPS is enforced (Railway does this automatically)
- [ ] Sensitive data not logged

## Backup Strategy

### Database Backups
Railway automatically backs up PostgreSQL databases.

Manual backup:
```bash
pg_dump $DATABASE_URL > backup.sql
```

Restore:
```bash
psql $DATABASE_URL < backup.sql
```

## Rolling Back

If deployment fails:
1. Railway keeps previous successful deployments
2. Go to Deployments tab
3. Click on previous successful deployment
4. Click "Redeploy"

## Support

For issues:
1. Check Railway logs
2. Check browser console for frontend errors
3. Verify environment variables
4. Check database connection
5. Review COMPLETE_SETUP_GUIDE.md for detailed setup instructions