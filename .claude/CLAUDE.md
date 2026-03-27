# Project: EduHabit

## Purpose
EduHabit is a personal assistant web application that helps users build better habits and manage their daily life. It combines health insights (powered by Google Gemini AI), task management, financial savings tracking, and daily habit tracking into a single gamified platform with achievements, levels, and badges.

## Tech Stack
- **Framework:** Next.js 15 (App Router, Server Components, Turbopack)
- **Language:** TypeScript
- **Database:** SQLite via Drizzle ORM
- **Authentication:** NextAuth.js v5 (Google OAuth + Credentials)
- **Styling:** CSS Modules + Framer Motion (glassmorphism design)
- **Internationalization:** next-intl (English + Indonesian)
- **AI Integration:** Google Gemini API (via Google AI Studio / @google/generative-ai SDK)
- **Package Manager:** npm
- **Testing:** Playwright via MCP (executed through Gemini CLI MCP using Gemini 3 Flash)
- **Node.js:** v20+ (LTS)

## Folder Structure
```
eduhabit/
├── .claude/                    # Claude Code project config
│   ├── CLAUDE.md              # This file (permanent)
│   ├── agents/                # Temporary phase agents
│   ├── spec.md                # Feature spec (temporary)
│   ├── plan.md                # Implementation plan (temporary)
│   └── progress.md            # Progress tracker (temporary)
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (main)/            # Main app pages (authenticated)
│   │   │   ├── dashboard/     # Dashboard with summary + calendar
│   │   │   ├── health/        # Health Insight (mood, sleep, nutrition)
│   │   │   ├── todos/         # ToDo List management
│   │   │   ├── finance/       # Finance / Savings management
│   │   │   ├── habits/        # Daily Habit Tracker
│   │   │   ├── achievements/  # Points, levels, badges
│   │   │   └── profile/       # User profile settings
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── health/        # Health insight APIs
│   │   │   ├── todos/         # Todo CRUD APIs
│   │   │   ├── finance/       # Finance/savings APIs
│   │   │   ├── habits/        # Habit tracker APIs
│   │   │   ├── achievements/  # Achievement/points APIs
│   │   │   └── profile/       # Profile APIs
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing/redirect
│   ├── components/
│   │   ├── ui/                # Reusable UI components (buttons, cards, modals, inputs)
│   │   ├── layout/            # Layout components (sidebar, navbar, footer)
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── health/            # Health feature components
│   │   ├── todos/             # Todo feature components
│   │   ├── finance/           # Finance feature components
│   │   ├── habits/            # Habit feature components
│   │   └── achievements/      # Achievement components
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema definitions
│   │   ├── index.ts           # Database connection
│   │   └── migrations/        # Drizzle migration files
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── gemini.ts          # Google Gemini API client
│   │   ├── achievements.ts    # Points/level/badge calculation logic
│   │   └── utils.ts           # Shared utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── styles/
│   │   ├── globals.css        # Global styles, CSS variables, theme tokens
│   │   └── themes/            # Light/dark theme definitions
│   ├── i18n/
│   │   ├── en.json            # English translations
│   │   ├── id.json            # Indonesian translations
│   │   └── request.ts         # next-intl config
│   └── types/                 # TypeScript type definitions
├── public/
│   └── images/                # Static assets
├── drizzle.config.ts          # Drizzle ORM config
├── next.config.ts             # Next.js config
├── tsconfig.json
├── package.json
└── .env.local                 # Environment variables (not committed)
```

## Key Conventions
- **File naming:** kebab-case for files, PascalCase for components
- **API routes:** RESTful patterns via Next.js Route Handlers (app/api/)
- **Components:** Functional components with TypeScript, CSS Modules for styling
- **State management:** React Server Components where possible, client state via React hooks
- **Database queries:** Drizzle ORM query builder, no raw SQL
- **Imports:** Use `@/` path alias for `src/` directory
- **Error handling:** Try-catch in API routes, return proper HTTP status codes
- **Validation:** Zod for request validation on API routes

## Design Patterns
- **App Router patterns:** Server Components by default, `"use client"` only when needed
- **API layer:** Route Handlers in `app/api/` with Zod validation
- **Database access:** Repository-like functions in `src/lib/` or co-located with schema
- **Authentication:** NextAuth.js middleware for protected routes
- **i18n:** next-intl with server/client component support, JSON translation files
- **Theming:** CSS custom properties (variables) toggled by data attribute, CSS Modules per component
- **Animation:** Framer Motion for page transitions, micro-interactions, parallax effects

## UI Design System
- **Style:** Modern glassmorphism with frosted glass cards, blur effects, subtle transparency
- **Primary color:** Blue (#3B82F6) with gradient combinations (blue-to-purple, blue-to-cyan)
- **Glass effect:** `backdrop-filter: blur(16px)`, semi-transparent backgrounds, subtle borders
- **Animations:** Light hover animations, page transitions, parallax on dashboard widgets
- **Dark mode:** Adapted glassmorphism for dark backgrounds, lighter glass tints
- **Typography:** Clean sans-serif (Inter or system font stack)
- **Responsive:** Mobile-first design, breakpoints at 640px, 768px, 1024px, 1280px
- **Shadows:** Layered box-shadows for depth, colored shadows matching primary palette

## External Services & Integrations
- **Google Gemini API:** Used for Health Insight features (mood analysis, sleep analysis, nutrition advice). Requires `GOOGLE_GEMINI_API_KEY` env var. Use `@google/generative-ai` SDK.
- **Google OAuth:** For social login. Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars.
- **NextAuth.js:** Requires `NEXTAUTH_SECRET` and `NEXTAUTH_URL` env vars.

## Environment Variables
```
GOOGLE_GEMINI_API_KEY=       # Google AI Studio API key
GOOGLE_CLIENT_ID=            # Google OAuth client ID
GOOGLE_CLIENT_SECRET=        # Google OAuth client secret
NEXTAUTH_SECRET=             # NextAuth session secret
NEXTAUTH_URL=                # App URL (http://localhost:3000 for dev)
DATABASE_URL=                # SQLite database path (file:./eduhabit.db)
```

## Known Constraints & Gotchas
- **Health Insight rate limit:** Each sub-feature (mood, sleep, nutrition) can only be used once per day per user. Enforce server-side.
- **Savings target:** Only one active saving target at a time. Must complete or delete current before creating new.
- **Login streak:** Streak resets if user misses a day. Points increase by 5 every 10 days (day 1-10: 10pts, day 11-20: 15pts, day 21-30: 20pts, etc.)
- **SQLite concurrency:** SQLite handles one writer at a time. Use WAL mode for better concurrent read performance.
- **Gemini API:** Rate limits apply. Handle 429 errors gracefully with user-friendly messages.
- **File uploads:** Profile pictures need to be stored locally in `public/uploads/` or as base64 in DB. Keep file size limited (max 2MB).

## Rules
- Follow conventional commits: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`
- Never push to git — only `git add` + `git commit`
- Never commit `.env.local` or any file containing secrets
- Always validate API inputs with Zod schemas
- Always check authentication on protected API routes
- Use server components by default, mark `"use client"` only when interactivity is needed
- All user-facing strings must use next-intl translation keys (no hardcoded text)
- CSS Modules for component styles, global CSS only for theme variables and resets
- Mobile-first responsive design — test at 375px width minimum
- All database schema changes must use Drizzle migrations

## Achievement System

### Points Rules
| Action | Points |
|---|---|
| Complete a todo task | +100 |
| Use Mood Checker (once/day) | +25 |
| Use Sleep Analysis (once/day) | +25 |
| Use Nutrition Advisor (once/day) | +25 |
| Add money to savings | +100 |
| Complete a daily habit | +50 |
| Login streak (per day) | +10 base (increases by +5 every 10 days) |

### Login Streak Points Formula
```
bonus = floor((streakDay - 1) / 10) * 5
dailyPoints = 10 + bonus
```
- Days 1-10: 10 pts/day
- Days 11-20: 15 pts/day
- Days 21-30: 20 pts/day
- Days 31-40: 25 pts/day
- ...and so on

### Level System (20 Levels)
| Level | Title | Points Required | Cumulative |
|---|---|---|---|
| 1 | Newcomer | 0 | 0 |
| 2 | Beginner | 500 | 500 |
| 3 | Learner | 1,000 | 1,500 |
| 4 | Explorer | 1,500 | 3,000 |
| 5 | Apprentice | 2,000 | 5,000 |
| 6 | Dedicated | 3,000 | 8,000 |
| 7 | Achiever | 4,000 | 12,000 |
| 8 | Specialist | 5,000 | 17,000 |
| 9 | Expert | 6,000 | 23,000 |
| 10 | Veteran | 7,000 | 30,000 |
| 11 | Master | 10,000 | 40,000 |
| 12 | Grandmaster | 15,000 | 55,000 |
| 13 | Champion | 20,000 | 75,000 |
| 14 | Legend | 25,000 | 100,000 |
| 15 | Mythic | 30,000 | 130,000 |
| 16 | Transcendent | 35,000 | 165,000 |
| 17 | Enlightened | 45,000 | 210,000 |
| 18 | Sage | 55,000 | 265,000 |
| 19 | Ascendant | 70,000 | 335,000 |
| 20 | Nexus Master | 90,000 | 425,000 |

*Estimated ~3-4 months of active daily use to reach Level 10. Level 20 requires ~1+ year of dedicated use.*

### Badge System
**Health Badges:**
| Badge | Condition |
|---|---|
| Mood Beginner | Use Mood Checker 7 times |
| Mood Master | Use Mood Checker 30 times |
| Sleep Apprentice | Use Sleep Analysis 7 times |
| Sleep Guru | Use Sleep Analysis 30 times |
| Nutrition Rookie | Use Nutrition Advisor 7 times |
| Nutrition Expert | Use Nutrition Advisor 30 times |
| Healthy Care Master | Use all 3 health features for 14 consecutive days |
| Wellness Champion | Use all 3 health features for 30 consecutive days |

**Finance Badges:**
| Badge | Condition |
|---|---|
| First Saver | Add money to savings for the first time |
| Junior Accountant | Complete 1 saving target |
| Senior Accountant | Complete 3 saving targets |
| Financial Wizard | Complete 5 saving targets |
| Big Saver | Save a total of 1,000,000 (cumulative across all targets) |

**Todo Badges:**
| Badge | Condition |
|---|---|
| Task Starter | Complete 10 tasks |
| Task Manager | Complete 50 tasks |
| Productivity King | Complete 100 tasks |
| Zero Pending | Have 0 pending tasks (min 5 tasks completed) |

**Habit Badges:**
| Badge | Condition |
|---|---|
| Habit Beginner | Track all habits for 7 consecutive days |
| Habit Builder | Track all habits for 30 consecutive days |
| Habit Legend | Track all habits for 100 consecutive days |
| Habit Collector | Have 10+ active habits |

**Streak Badges:**
| Badge | Condition |
|---|---|
| Week Warrior | 7-day login streak |
| Monthly Devotee | 30-day login streak |
| Century Club | 100-day login streak |
| Year of Commitment | 365-day login streak |

**General Badges:**
| Badge | Condition |
|---|---|
| First Steps | Complete profile setup (name, status, picture) |
| All-Rounder | Use all 4 main features at least once |
| Rising Star | Reach Level 5 |
| EduHabit Veteran | Reach Level 10 |
| EduHabit Legend | Reach Level 15 |
| Nexus Master | Reach Level 20 |

*Badges must be manually claimed by the user. Claimed badges are displayed on the profile page.*

## Database Schema Overview
Core tables:
- `users` — id, email, name, password_hash, image, status, locale, theme, created_at
- `accounts` — NextAuth account linking (Google OAuth)
- `sessions` — NextAuth sessions
- `verification_tokens` — NextAuth email verification
- `moods` — user_id, mood, stress_source, sleep_quality, advice, date, points_awarded
- `sleep_analyses` — user_id, sleep_start, sleep_end, analysis, date, points_awarded
- `nutrition_logs` — user_id, diet_type, activity_level, advice, date, points_awarded
- `todos` — id, user_id, title, description, due_date, status (pending/done/cancelled), created_at
- `savings_targets` — id, user_id, purpose, target_amount, current_amount, due_date, status (active/completed/cancelled), created_at
- `savings_transactions` — id, target_id, amount, date, points_awarded
- `habits` — id, user_id, title, type (exercise/work/fun/other), active, created_at
- `habit_logs` — id, habit_id, date, completed, points_awarded
- `points_history` — id, user_id, action, points, description, created_at
- `user_badges` — id, user_id, badge_id, claimed_at
- `login_streaks` — user_id, current_streak, longest_streak, last_login_date, points_awarded_today

## Testing Stack
- **E2E Testing:** Playwright (via MCP through Gemini CLI)
- **Testing model:** Gemini 3 Flash (via Gemini CLI MCP with Playwright MCP)
- **Testing approach:** Gemini CLI MCP is called with instructions to use Playwright MCP for browser-based E2E testing. Gemini 3 Flash runs the tests and returns the report.
- **Test execution pattern:** Subagent (Sonnet wrapper) calls Gemini CLI MCP → Gemini Flash uses Playwright MCP → returns test report

## Important Files
- `src/db/schema.ts` — Database schema (read first to understand data model)
- `src/lib/auth.ts` — Authentication configuration
- `src/lib/gemini.ts` — Gemini AI integration
- `src/lib/achievements.ts` — Points, levels, and badge logic
- `src/app/layout.tsx` — Root layout with providers
- `src/i18n/en.json` — English translations (source of truth for all UI text)
- `.claude/CLAUDE.md` — This file

## How to Run
```bash
npm install                    # Install dependencies
npx drizzle-kit generate      # Generate migrations
npx drizzle-kit migrate       # Run migrations
npm run dev                    # Start dev server on http://localhost:3000
```

## How to Stop
```bash
# Ctrl+C in the terminal running `npm run dev`
```
