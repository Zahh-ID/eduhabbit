# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server (Turbopack) on http://localhost:3000
npm run build            # Production build
npm run lint             # ESLint
npm run db:generate      # Generate Drizzle migrations after schema changes
npm run db:migrate       # Apply migrations to SQLite database
npm run db:studio        # Open Drizzle Studio (DB GUI)
```

After modifying `src/db/schema.ts`, always run `db:generate` then `db:migrate`.

## Architecture

**Next.js 15 App Router** with TypeScript, SQLite (Drizzle ORM), NextAuth.js v5, next-intl, CSS Modules + Framer Motion.

### Route Groups
- `src/app/(auth)/` — Login/register pages, simple card layout, no auth required
- `src/app/(main)/` — All authenticated pages. Server Component layout checks auth, delegates to `layout-client.tsx` for client-side sidebar/navbar shell

### Auth Flow
- **Middleware** (`src/middleware.ts`): JWT token check via `next-auth/jwt`. Protects all `(main)` routes, redirects authenticated users away from auth pages.
- **Auth config** (`src/lib/auth.ts`): Google OAuth + credentials provider, JWT session strategy, DrizzleAdapter.
- **API routes**: Every protected route calls `auth()` and checks `session.user.id` early.

### API Route Patterns
All routes in `src/app/api/` follow this structure:
1. Auth check via `auth()` → 401 if missing
2. Zod schema validation on request body
3. Business logic with constraint enforcement (e.g., one-per-day health checks, one active savings target)
4. Points awarding: inserts into both the feature table AND `pointsHistory` for audit trail
5. Error logging with route context tags like `[POST /api/health/mood]`

### Database
- **SQLite** with WAL mode and foreign keys enabled (`src/db/index.ts`)
- Schema in `src/db/schema.ts` — all tables use UUID text primary keys via `crypto.randomUUID()`
- Date fields are stored as `text` in YYYY-MM-DD format (not timestamps) for daily enforcement checks
- `DATABASE_URL` defaults to `file:./eduhabit.db`

### i18n
- next-intl with locale resolved from cookies, fallback to "en" (`src/i18n/request.ts`)
- Translation files: `src/i18n/en.json`, `src/i18n/id.json`
- All user-facing strings must use translation keys — no hardcoded text

### Theme System
- CSS custom properties toggled by `data-theme` attribute
- A `<script>` in the root layout reads `localStorage` before hydration to prevent flash of wrong theme
- Glassmorphism design: frosted glass cards, blur effects, semi-transparent backgrounds

### Gamification (`src/lib/achievements.ts`)
- Points awarded per action (defined in `POINTS` constant), login streak bonus increases every 10 days
- 20-level system with cumulative point thresholds
- Badges are manually claimed by users; definitions in `BADGES` array with category grouping

### Gemini AI Integration
- `src/lib/gemini.ts`: minimal wrapper returning a model instance
- Used by health API routes (mood, sleep, nutrition) with per-route model selection (e.g., "gemini-2.5-flash-lite")
- Rate limit (429) handling is in each route handler, not centralized

## Conventions
- `@/` path alias maps to `src/`
- kebab-case files, PascalCase components
- Server Components by default, `"use client"` only when interactivity is needed
- CSS Modules per component, global CSS only for theme variables/resets
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- Never push to git — only `git add` + `git commit`

## Key Constraints
- Health insight sub-features (mood/sleep/nutrition): once per day per user, enforced server-side via date column
- Savings: only one active target at a time; must complete/cancel before creating new
- Login streak resets on missed day; points formula: `10 + floor((day-1)/10) * 5`
- SQLite single-writer constraint — WAL mode helps with concurrent reads
- Profile pictures: local storage in `public/uploads/` or base64, max 2MB
