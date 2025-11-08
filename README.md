# MostlyMyelinated

A spaced repetition system (SRS) for veterinary neurology built on Railway with PostgreSQL, Express, React, and TypeScript.

## Features

- **Node-based organization**: Organize knowledge hierarchically
- **Automatic card generation**: Smart templates create multiple cards from facts
- **FSRS scheduling**: State-of-the-art spaced repetition algorithm
- **NodeStrength tracking**: Visual progress indicators for each topic
- **Weighted review**: Prioritizes weaker topics automatically
- **Quick-add bar**: Rapid fact entry with type detection
- **PWA-ready**: Install as mobile app

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (Railway)
- Prisma ORM
- ts-fsrs (FSRS algorithm)
- JWT authentication

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router

## Project Structure

```
MostlyMyelinated/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── routes/                # API endpoints
│   │   ├── services/              # Core algorithms
│   │   │   ├── nodeStrength.ts    # NodeStrength calculation
│   │   │   ├── fsrsScheduler.ts   # FSRS integration
│   │   │   ├── studySession.ts    # Weighted review selection
│   │   │   └── cardGenerator.ts   # Card template system
│   │   ├── middleware/            # Auth, error handling
│   │   ├── types/                 # TypeScript types
│   │   └── index.ts               # Express app
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/                 # React pages
│   │   ├── components/            # Reusable components
│   │   ├── services/              # API client
│   │   └── types/                 # TypeScript types
│   └── package.json
│
└── railway.json                    # Railway config
```

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. **Clone the repository**

```bash
git clone <repo-url>
cd MostlyMyelinated
```

2. **Backend setup**

```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

Backend runs on `http://localhost:3000`

3. **Frontend setup**

```bash
cd frontend
npm install

# Set up environment variables (optional)
cp .env.example .env

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

## Railway Deployment

### 1. Create Railway project

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

### 2. Add PostgreSQL

In Railway dashboard:
- Add PostgreSQL database service
- Copy the `DATABASE_URL` connection string

### 3. Configure environment variables

In Railway project settings, add:

```
DATABASE_URL=<from PostgreSQL service>
JWT_SECRET=<generate a random secret>
NODE_ENV=production
PORT=3000
```

### 4. Deploy

```bash
# Link to Railway project
railway link

# Deploy
git push railway main
```

### 5. Run migrations

```bash
railway run npx prisma migrate deploy
```

## Core Algorithms

### Algorithm 1: NodeStrength Calculation

Calculates topic mastery (0-100%) based on recent review performance:

- Takes last 30 reviews across all cards in a node
- Applies exponential decay weighting (recent reviews matter more)
- Maps to clinical labels: Brain-dead (0-20) → Hyperreflexic professor (95-100)

### Algorithm 2: Weighted Review Selection

Selects cards for review with bias toward weaker topics:

- **Critical/Weak (0-40)**: 40% of session
- **Weak (40-60)**: 30% of session
- **Moderate (60-85)**: 20% of session
- **Strong (85-100)**: 10% of session

Round-robin within bands ensures variety.

### Card Generation Templates

Automatically creates multiple cards from structured facts:

- **Definition**: `Term = Definition` → 3 cards (What is X?, Define X, Term → Definition)
- **Association**: `A → B` → 3 cards (forward, reverse, cloze)
- **Localization**: `Structure in Location` → 3 cards
- **Comparison**: `A vs B: difference` → 3 cards
- **Clinical**: `Condition: symptoms` → 3 cards
- **Simple**: Fallback for unstructured facts

## Usage Workflow

### 1. Create a Node

```
Dashboard → Create Node → "Spinal Cord Anatomy"
```

### 2. Add Facts

```
Node Detail → Quick Add Bar
"Neural folds fuse dorsally → neural tube"
Select type: "Association"
→ Generates 3 cards automatically
```

### 3. Study

```
Dashboard → Study (shows due count)
→ Review cards with Again/Hard/Good/Easy buttons
→ FSRS schedules next review automatically
→ NodeStrength updates in real-time
```

### 4. Track Progress

```
Dashboard → View nodes sorted by strength
→ Focus on weakest topics (red/orange badges)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Log in
- `GET /api/auth/me` - Get current user

### Nodes
- `GET /api/nodes` - List all nodes
- `GET /api/nodes/:id` - Get node details
- `POST /api/nodes` - Create node
- `PATCH /api/nodes/:id` - Update node
- `DELETE /api/nodes/:id` - Delete node
- `GET /api/nodes/:id/strength` - Get NodeStrength

### Facts
- `POST /api/facts` - Create fact
- `PATCH /api/facts/:id` - Update fact
- `DELETE /api/facts/:id` - Delete fact
- `POST /api/facts/:id/generate-cards` - Generate cards from fact

### Cards
- `GET /api/cards/:id` - Get card
- `POST /api/cards` - Create card manually
- `PATCH /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `POST /api/cards/:id/review` - Submit review (rating 0-3)

### Study
- `GET /api/study/session?max=80` - Get weighted review session
- `GET /api/study/stats` - Get study statistics
- `GET /api/study/progress/:nodeId` - Get node progress over time

## Database Schema

### Key Models

- **User**: Authentication
- **Node**: Knowledge hierarchy with strength tracking
- **Fact**: Structured knowledge statements
- **Card**: Flashcards with FSRS scheduling data
- **Review**: Review history with grades

See `backend/prisma/schema.prisma` for full schema.

## Development Roadmap

### MVP (Current)
- ✅ Core SRS with FSRS
- ✅ Node hierarchy
- ✅ NodeStrength calculation
- ✅ Weighted review selection
- ✅ Card generation templates
- ✅ Basic UI

### Phase 2
- [ ] Image upload and annotation
- [ ] Image occlusion cards
- [ ] Parent/child node relationships UI
- [ ] Advanced stats and charts
- [ ] CSV import/export
- [ ] Mobile PWA optimizations

### Phase 3
- [ ] Shared decks
- [ ] Collaborative editing
- [ ] AI-assisted card generation
- [ ] Voice input
- [ ] Offline support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, open a GitHub issue.

---

Built for veterinary neurology students, by a vet who got tired of Firebase.
