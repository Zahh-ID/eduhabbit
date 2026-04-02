# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install             # Install dependencies (use pnpm, not npm)
pnpm run dev             # Start dev server (Turbopack) on http://localhost:3000
pnpm run build           # Production build
pnpm run lint            # ESLint
pnpm run db:generate     # Generate Drizzle migrations after schema changes
pnpm run db:migrate      # Apply migrations to MySQL database
pnpm run db:studio       # Open Drizzle Studio (DB GUI)
```

After modifying `src/db/schema.ts`, always run `db:generate` then `db:migrate`.

On this server, prefix Node commands with `NODE_OPTIONS="--dns-result-order=ipv4first"` to avoid IPv6 timeout issues with external services.

## Architecture

**Next.js 15 App Router** with TypeScript, **MySQL** (Drizzle ORM), NextAuth.js v5, next-intl, CSS Modules + Framer Motion.

### Route Groups
- `src/app/(auth)/` — Login/register pages, no auth required
- `src/app/(main)/` — All authenticated pages. Server Component layout checks auth, delegates to `layout-client.tsx` for client-side sidebar/navbar shell

### Auth Flow
- **Middleware** (`src/middleware.ts`): JWT token check via `next-auth/jwt`. Protects all `(main)` routes.
- **Auth config** (`src/lib/auth.ts`): Google OAuth + credentials provider, JWT session strategy, DrizzleAdapter with explicit table mapping (`usersTable`, `accountsTable`, `sessionsTable`, `verificationTokensTable`). The `as any` casts on tables are intentional — drizzle-orm 0.41 type internals are incompatible with the adapter's expected types but work correctly at runtime.
- **API routes**: Every protected route calls `auth()` and checks `session.user.id` early.

### Database
- **MySQL** via `mysql2` connection pool (`src/db/index.ts`)
- Schema in `src/db/schema.ts` — all app tables use UUID varchar(36) primary keys via `crypto.randomUUID()` as `$defaultFn`. When inserting and needing the row back, pre-generate the UUID, pass it explicitly in `.values({ id: newId, ... })`, then `SELECT` by that id — MySQL/Drizzle does not support `.returning()`.
- Date fields stored as `text` in YYYY-MM-DD format for daily enforcement checks
- `DATABASE_URL` format: `mysql://user:password@localhost:3306/dbname`

### API Route Patterns
All routes in `src/app/api/` follow this structure:
1. Auth check via `auth()` → 401 if missing
2. Zod schema validation on request body
3. Business logic with constraint enforcement
4. Points awarding: inserts into both the feature table AND `pointsHistory` for audit trail
5. Error logging with route context tags like `[POST /api/health/mood]`

### i18n
- next-intl with locale resolved from cookies, fallback to "en" (`src/i18n/request.ts`)
- Translation files: `src/i18n/en.json`, `src/i18n/id.json`
- All user-facing strings must use translation keys — no hardcoded text

### Theme System
- CSS custom properties toggled by `data-theme` attribute
- A `<script>` in the root layout reads `localStorage` before hydration to prevent flash of wrong theme

### Gamification (`src/lib/achievements.ts`)
- Points awarded per action (defined in `POINTS` constant), login streak bonus increases every 10 days
- 20-level system with cumulative point thresholds
- Badges are manually claimed by users; definitions in `BADGES` array with category grouping

### Gemini AI Integration
- `src/lib/gemini.ts`: minimal wrapper returning a model instance
- Used by health API routes (mood, sleep, nutrition) with per-route model selection
- Rate limit (429) handling is in each route handler, not centralized

## Key Constraints
- Health insight sub-features (mood/sleep/nutrition): once per day per user, enforced server-side via date column
- Savings: only one active target at a time; must complete/cancel before creating new
- Login streak resets on missed day; points formula: `10 + floor((day-1)/10) * 5`
- Profile pictures: local storage in `public/uploads/` or base64, max 2MB

## Conventions
- `@/` path alias maps to `src/`
- kebab-case files, PascalCase components
- Server Components by default, `"use client"` only when interactivity is needed
- CSS Modules per component, global CSS only for theme variables/resets
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
