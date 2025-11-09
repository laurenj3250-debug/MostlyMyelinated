# Quick Start: Gamification Integration

## Immediate Steps to Get Running

### 1. Database Migration (REQUIRED)
```bash
cd /Users/laurenjohnston/laurenj3250-debug/MostlyMyelinated/backend

# Create .env if needed (copy from .env.example)
cp .env.example .env
# Edit .env and add your DATABASE_URL

# Run migration
npx prisma migrate dev --name add_gamification_fields
npx prisma generate
```

### 2. Add Badge Gallery Route

Edit `frontend/src/App.tsx`:

```typescript
// Add import at top
import BadgeGallery from './pages/BadgeGallery';

// Add route in your Routes (around line 20-30)
<Route path="/badges" element={<BadgeGallery />} />
```

### 3. Test Backend API

Start backend:
```bash
cd backend
npm run dev
```

Test endpoints (with your auth token):
```bash
# Get level progress
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/gamification/level-progress

# Get badges
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/gamification/badges

# Get stats
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/gamification/stats
```

### 4. Test Frontend

Start frontend:
```bash
cd frontend
npm run dev
```

Navigate to: `http://localhost:5173/badges`

### 5. Quick Component Usage Examples

#### Show XP Bar in Header
```typescript
// In your Header/Layout component
import XPBar from '../components/XPBar';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Header() {
  const [levelData, setLevelData] = useState(null);

  useEffect(() => {
    const fetchLevel = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/gamification/level-progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLevelData(res.data);
    };
    fetchLevel();
  }, []);

  return (
    <header>
      {levelData && (
        <XPBar
          level={levelData.level}
          xp={levelData.xp}
          xpToNextLevel={levelData.xpToNextLevel}
          title={levelData.title}
          totalXpEarned={levelData.totalXpEarned}
        />
      )}
    </header>
  );
}
```

#### Add Combo Counter to Study Page
```typescript
// In Study.tsx
import ComboCounter from '../components/ComboCounter';
import { useState } from 'react';

function Study() {
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  // After each review, update from API response:
  // setCombo(response.data.combo.current);
  // setMultiplier(response.data.combo.multiplier);

  return (
    <div>
      <ComboCounter combo={combo} multiplier={multiplier} />
      {/* Your study content */}
    </div>
  );
}
```

#### Trigger Level Up Modal
```typescript
import LevelUpModal from '../components/LevelUpModal';
import { useState } from 'react';

function Study() {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  // After review, check response.data.xp.leveledUp
  // If true:
  // setLevelUpData({ oldLevel, newLevel, newTitle });
  // setShowLevelUp(true);

  return (
    <div>
      {showLevelUp && levelUpData && (
        <LevelUpModal
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          newTitle={levelUpData.newTitle}
          onClose={() => setShowLevelUp(false)}
        />
      )}
    </div>
  );
}
```

#### Show Session Recap
```typescript
import SessionRecap from '../components/SessionRecap';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Study() {
  const [showRecap, setShowRecap] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);

  const endSession = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:3000/api/gamification/session-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSessionStats(res.data);
    setShowRecap(true);
  };

  return (
    <div>
      {showRecap && sessionStats && (
        <SessionRecap
          stats={sessionStats}
          onClose={() => setShowRecap(false)}
        />
      )}
      <button onClick={endSession}>End Session</button>
    </div>
  );
}
```

#### Add Streak Flame to Dashboard
```typescript
import StreakFlame from '../components/StreakFlame';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchStreak = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/gamification/streak', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStreak(res.data.streak);
    };
    fetchStreak();
  }, []);

  return (
    <div>
      <StreakFlame streak={streak} size="large" showNumber={true} />
    </div>
  );
}
```

#### Add Progress Bars
```typescript
import ProgressBar from '../components/ProgressBar';

function Dashboard() {
  return (
    <div>
      {/* Daily goal */}
      <ProgressBar
        current={23}
        total={50}
        label="Daily Review Goal"
        colorScheme="gradient"
        size="medium"
        showNumbers={true}
        showPercentage={true}
      />

      {/* Weekly goal */}
      <ProgressBar
        current={147}
        total={350}
        label="Weekly Reviews"
        colorScheme="purple"
        size="medium"
      />

      {/* Node strength */}
      <ProgressBar
        current={75}
        total={100}
        label="Brainstem Knowledge"
        colorScheme="gradient"
        size="small"
      />
    </div>
  );
}
```

#### Trigger Confetti
```typescript
import { celebrationConfetti, legendaryConfetti, sparkleConfetti } from '../utils/confetti';

// Level up
legendaryConfetti();

// Session complete
celebrationConfetti();

// Correct answer
sparkleConfetti(cardElement);
```

---

## File Locations Reference

### Backend
- Schema: `backend/prisma/schema.prisma`
- Gamification service: `backend/src/services/gamification.ts`
- Badges (58 total): `backend/src/services/badges.ts`
- API routes: `backend/src/routes/gamification.ts`
- Updated review: `backend/src/routes/cards.ts`
- Main: `backend/src/index.ts`

### Frontend
- Confetti utils: `frontend/src/utils/confetti.ts`
- XPBar: `frontend/src/components/XPBar.tsx`
- ComboCounter: `frontend/src/components/ComboCounter.tsx`
- StreakFlame: `frontend/src/components/StreakFlame.tsx`
- ProgressBar: `frontend/src/components/ProgressBar.tsx`
- SessionRecap: `frontend/src/components/SessionRecap.tsx`
- LevelUpModal: `frontend/src/components/LevelUpModal.tsx`
- BadgeGallery: `frontend/src/pages/BadgeGallery.tsx`

---

## Common Issues & Fixes

### "DATABASE_URL not found"
```bash
cd backend
cp .env.example .env
# Edit .env and add your actual DATABASE_URL
```

### "Module not found: canvas-confetti"
```bash
cd frontend
npm install canvas-confetti react-countup
```

### "Cannot find module './pages/BadgeGallery'"
Add the route in App.tsx:
```typescript
import BadgeGallery from './pages/BadgeGallery';
<Route path="/badges" element={<BadgeGallery />} />
```

### Badge gallery shows "No badges"
The backend needs to run migration first:
```bash
cd backend
npx prisma migrate dev
```

### Level/XP not updating
Check that the review endpoint is returning gamification data:
```bash
# Test review endpoint
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 3}' \
  http://localhost:3000/api/cards/CARD_ID/review
```

---

## Testing Checklist

After integration:

- [ ] Badge gallery loads at `/badges`
- [ ] XP bar shows in header
- [ ] Review awards XP
- [ ] Combo counter appears on 3+ streak
- [ ] Level up modal triggers
- [ ] Session recap appears after studying
- [ ] Confetti triggers
- [ ] Streak flame displays
- [ ] Progress bars fill
- [ ] Roast messages appear
- [ ] Celebration messages appear
- [ ] Badge unlocks show
- [ ] All animations smooth

---

## Development Workflow

1. **Backend changes**: Edit files → `npm run dev` auto-reloads
2. **Frontend changes**: Edit files → Vite auto-reloads
3. **Database changes**: Edit schema → `npx prisma migrate dev`
4. **New components**: Create file → Import in parent
5. **Test API**: Use curl or Postman with your auth token

---

## Production Deployment

Before deploying:

1. Run migration on production database
2. Build backend: `cd backend && npm run build`
3. Build frontend: `cd frontend && npm run build`
4. Set environment variables on host
5. Test all endpoints with production URL

---

**You now have a MAXIMUM DOPAMINE GAMIFICATION MACHINE ready to integrate!**
