# Migration Guide for Neuro-Gamification Features

This guide will help you apply the database schema changes required for the new features.

## Database Changes

The following fields have been added to the User model:
- `maxReviewsPerDay` (Int, default: 100)
- `maxNewCardsPerDay` (Int, default: 10)
- `badges` (Json, default: "[]")

## Running the Migration

### Step 1: Navigate to the backend directory
```bash
cd backend
```

### Step 2: Create the migration
```bash
npm run prisma:migrate
```

When prompted, give the migration a meaningful name like: `add_user_preferences_and_badges`

### Step 3: Verify the migration
The migration will:
1. Add the new columns to the User table
2. Set default values for existing users
3. Generate updated Prisma client types

### Step 4: Restart your backend server
```bash
npm run dev
```

## Verifying the Migration

After running the migration, you can verify it worked by:

1. Opening Prisma Studio:
```bash
npm run prisma:studio
```

2. Navigate to the User table and verify the new fields are present

## Rollback (if needed)

If you need to rollback this migration:
```bash
npx prisma migrate reset
```

**WARNING:** This will delete all data in your database!

## Troubleshooting

### Migration fails due to existing data
If the migration fails, it's likely because you have existing users without the new fields. The migration should handle this automatically with default values, but if it doesn't:

1. Backup your database
2. Manually add the columns via SQL:
```sql
ALTER TABLE "User" ADD COLUMN "maxReviewsPerDay" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "User" ADD COLUMN "maxNewCardsPerDay" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "User" ADD COLUMN "badges" JSONB NOT NULL DEFAULT '[]'::jsonb;
```

### Schema out of sync
If you get schema drift warnings:
```bash
npx prisma migrate resolve --applied <migration-name>
```

## Next Steps

After the migration is complete, all new features should work properly:
- User preferences for daily review caps
- Badge system tracking achievements
- All neuro-themed gamification features
