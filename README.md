# MostlyMyelinated

A spaced repetition system (SRS) for veterinary neurology built on Railway with PostgreSQL, Express, React, and TypeScript.

## Features

### Core Learning Features
- **Node-based organization**: Organize knowledge hierarchically
- **Automatic card generation**: Smart templates create multiple cards from facts
- **Card preview/edit**: Review and edit generated cards before saving
- **FSRS scheduling**: State-of-the-art spaced repetition algorithm
- **NodeStrength tracking**: Visual progress indicators for each topic
- **Weighted review**: Prioritizes weaker topics automatically
- **Quick-add bar**: Rapid fact entry with type detection

### Visual Learning
- **Image upload**: Drag and drop images to nodes and facts
- **Image annotation**: Draw arrows, highlights, and text labels on images
- **Image compression**: Automatic optimization for storage efficiency

### Mobile & PWA
- **Progressive Web App**: Install as standalone app on mobile and desktop
- **Offline support**: Service worker enables offline access to cached content
- **Mobile-optimized**: Touch-friendly interface with responsive design
- **Cross-platform**: Works on iOS, Android, and desktop browsers

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (Railway)
- Prisma ORM
- ts-fsrs (FSRS algorithm)
- JWT authentication
- Multer (file uploads)
- Sharp (image processing)

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
- `POST /api/facts/:id/preview-cards` - Preview generated cards (no save)
- `POST /api/facts/:id/generate-cards` - Generate and save cards from fact

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

### Images
- `POST /api/images/node/:nodeId` - Upload image to node
- `POST /api/images/fact/:factId` - Upload image to fact
- `GET /api/images/node/:nodeId` - Get all node images
- `GET /api/images/fact/:factId` - Get all fact images
- `DELETE /api/images/node/:imageId` - Delete node image
- `DELETE /api/images/fact/:imageId` - Delete fact image
- `POST /api/images/annotate/:imageId` - Save annotated image

## Database Schema

### Key Models

- **User**: Authentication
- **Node**: Knowledge hierarchy with strength tracking
- **Fact**: Structured knowledge statements
- **Card**: Flashcards with FSRS scheduling data
- **Review**: Review history with grades

See `backend/prisma/schema.prisma` for full schema.

## Development Roadmap

### MVP (Completed)
- ✅ Core SRS with FSRS
- ✅ Node hierarchy
- ✅ NodeStrength calculation
- ✅ Weighted review selection
- ✅ Card generation templates
- ✅ Card preview/edit before save
- ✅ Image upload and annotation
- ✅ Image compression and optimization
- ✅ Mobile PWA support
- ✅ Offline caching
- ✅ Responsive UI

### Phase 2
- [ ] Image occlusion cards
- [ ] Cloud storage for images (S3/R2)
- [ ] Parent/child node relationships UI
- [ ] Advanced stats and charts
- [ ] CSV import/export
- [ ] Offline study review queue
- [ ] Automated testing

### Phase 3
- [ ] Shared decks
- [ ] Collaborative editing
- [ ] Enhanced AI features
- [ ] Voice input
- [ ] Desktop app (Electron)
- [ ] Performance optimizations

## Documentation

- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Detailed setup instructions for development
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Railway deployment guide with troubleshooting
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Step-by-step testing for all features
- **[MVP_IMPLEMENTATION_SUMMARY.md](./MVP_IMPLEMENTATION_SUMMARY.md)** - Implementation details and architecture
- **[AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md)** - AI features and Claude integration

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
