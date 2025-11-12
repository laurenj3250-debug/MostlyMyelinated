# Environment Variables

This document lists all required environment variables for the MostlyMyelinated application.

## Backend Environment Variables

### Required

| Variable | Description | Example | Where Used |
|----------|-------------|---------|------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | Prisma ORM, all database operations |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secret-jwt-key-here` | Authentication middleware |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key for AI features | `sk-ant-api03-...` | AI text extraction, node generation |

### Optional

| Variable | Description | Default | Where Used |
|----------|-------------|---------|------------|
| `AI_CHUNK_SIZE` | Max characters per AI processing chunk | `100000` | Large textbook processing |
| `AI_RATE_LIMIT_DELAY_MS` | Delay between AI chunks (ms) | `1000` | Rate limiting for chunked processing |
| `PORT` | Server port | `3000` | Express server |

## Frontend Environment Variables

### Required

None - frontend uses relative `/api` paths that work in both dev and production.

### Development Only

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL (optional) | `http://localhost:3000` |

## Railway Deployment

### Backend Service Variables

```
DATABASE_URL=<automatically set by Railway Postgres>
JWT_SECRET=<generate with: openssl rand -base64 32>
ANTHROPIC_API_KEY=sk-ant-api03-<your-key-here>
```

### How to Add Variables on Railway

1. Go to https://railway.app/project
2. Select your **backend** service
3. Click **Variables** tab
4. Add each variable with **+ New Variable**
5. Service will auto-redeploy after adding variables

## Getting API Keys

### Anthropic API Key
1. Go to https://console.anthropic.com/settings/keys
2. Click **Create Key**
3. Copy the key (starts with `sk-ant-`)
4. Add to Railway backend variables as `ANTHROPIC_API_KEY`
5. **Important**: Never commit API keys to git!

### JWT Secret
Generate a secure random string:
```bash
openssl rand -base64 32
```

## Development Setup

### Backend (.env file)
Create `backend/.env`:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neuronode"
JWT_SECRET="your-jwt-secret-here"
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
```

### Frontend (.env file)
No environment file needed for local development.

## Troubleshooting

### "Internal server error" on AI extraction
- **Cause**: `ANTHROPIC_API_KEY` not set or invalid
- **Fix**: Check Railway variables, ensure key starts with `sk-ant-`

### "Failed to get critical nodes" 404 error
- **Cause**: Route ordering issue (fixed in latest version)
- **Fix**: Deploy latest code from main branch

### "Failed to delete all nodes"
- **Cause**: Route ordering issue (fixed in latest version)
- **Fix**: Deploy latest code from main branch

### Database connection errors
- **Cause**: Invalid `DATABASE_URL` or database not accessible
- **Fix**: Check Railway Postgres is provisioned and URL is correct

## Security Notes

1. **Never commit `.env` files** to git (already in `.gitignore`)
2. **Rotate JWT_SECRET** if compromised - will log out all users
3. **Monitor Anthropic API usage** to avoid unexpected bills
4. **Use strong JWT secrets** (minimum 32 characters, random)

## AI Model Configuration

Current model used for all AI operations:
- **Model**: `claude-sonnet-4-20250514` (Claude Sonnet 4)
- **Max Tokens**: 8000 for node extraction, 2000 for facts, 1500 for cards
- **Context Window**: 200k tokens

If you encounter model errors, check:
1. Model ID is valid (see https://docs.anthropic.com/en/docs/about-claude/models)
2. API key has access to the model
3. Anthropic API is not experiencing outages
