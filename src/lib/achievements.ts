// ─── Points Per Action ─────────────────────────────────────────────────────

export const POINTS = {
  COMPLETE_TODO: 100,
  MOOD_CHECKER: 25,
  SLEEP_ANALYSIS: 25,
  NUTRITION_ADVISOR: 25,
  ADD_SAVINGS: 100,
  COMPLETE_HABIT: 50,
} as const;

export function getLoginStreakPoints(streakDay: number): number {
  const bonus = Math.floor((streakDay - 1) / 10) * 5;
  return 10 + bonus;
}

// ─── Level System ──────────────────────────────────────────────────────────

export interface Level {
  level: number;
  title: string;
  cumulativePoints: number;
  pointsRequired: number;
}

export const LEVELS: Level[] = [
  { level: 1,  title: "Newcomer",     cumulativePoints: 0,       pointsRequired: 0       },
  { level: 2,  title: "Beginner",     cumulativePoints: 500,     pointsRequired: 500     },
  { level: 3,  title: "Learner",      cumulativePoints: 1500,    pointsRequired: 1000    },
  { level: 4,  title: "Explorer",     cumulativePoints: 3000,    pointsRequired: 1500    },
  { level: 5,  title: "Apprentice",   cumulativePoints: 5000,    pointsRequired: 2000    },
  { level: 6,  title: "Dedicated",    cumulativePoints: 8000,    pointsRequired: 3000    },
  { level: 7,  title: "Achiever",     cumulativePoints: 12000,   pointsRequired: 4000    },
  { level: 8,  title: "Specialist",   cumulativePoints: 17000,   pointsRequired: 5000    },
  { level: 9,  title: "Expert",       cumulativePoints: 23000,   pointsRequired: 6000    },
  { level: 10, title: "Veteran",      cumulativePoints: 30000,   pointsRequired: 7000    },
  { level: 11, title: "Master",       cumulativePoints: 40000,   pointsRequired: 10000   },
  { level: 12, title: "Grandmaster",  cumulativePoints: 55000,   pointsRequired: 15000   },
  { level: 13, title: "Champion",     cumulativePoints: 75000,   pointsRequired: 20000   },
  { level: 14, title: "Legend",       cumulativePoints: 100000,  pointsRequired: 25000   },
  { level: 15, title: "Mythic",       cumulativePoints: 130000,  pointsRequired: 30000   },
  { level: 16, title: "Transcendent", cumulativePoints: 165000,  pointsRequired: 35000   },
  { level: 17, title: "Enlightened",  cumulativePoints: 210000,  pointsRequired: 45000   },
  { level: 18, title: "Sage",         cumulativePoints: 265000,  pointsRequired: 55000   },
  { level: 19, title: "Ascendant",    cumulativePoints: 335000,  pointsRequired: 70000   },
  { level: 20, title: "Nexus Master", cumulativePoints: 425000,  pointsRequired: 90000   },
];

export function getLevelFromPoints(points: number): Level {
  let currentLevel = LEVELS[0];

  for (const level of LEVELS) {
    if (points >= level.cumulativePoints) {
      currentLevel = level;
    } else {
      break;
    }
  }

  return currentLevel;
}

export function getProgressToNextLevel(points: number): {
  current: Level;
  next: Level | null;
  progress: number;
  pointsToNext: number;
} {
  const current = getLevelFromPoints(points);
  const nextIndex = LEVELS.findIndex((l) => l.level === current.level + 1);
  const next = nextIndex !== -1 ? LEVELS[nextIndex] : null;

  if (!next) {
    return { current, next: null, progress: 100, pointsToNext: 0 };
  }

  const pointsInLevel = points - current.cumulativePoints;
  const pointsNeeded = next.cumulativePoints - current.cumulativePoints;
  const progress = Math.min(100, Math.floor((pointsInLevel / pointsNeeded) * 100));
  const pointsToNext = next.cumulativePoints - points;

  return { current, next, progress, pointsToNext };
}

// ─── Badge Definitions ─────────────────────────────────────────────────────

export type BadgeCategory = "health" | "finance" | "todo" | "habit" | "streak" | "general";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
}

export const BADGES: Badge[] = [
  // Health Badges
  {
    id: "mood_beginner",
    name: "Mood Beginner",
    description: "Use Mood Checker 7 times",
    category: "health",
  },
  {
    id: "mood_master",
    name: "Mood Master",
    description: "Use Mood Checker 30 times",
    category: "health",
  },
  {
    id: "sleep_apprentice",
    name: "Sleep Apprentice",
    description: "Use Sleep Analysis 7 times",
    category: "health",
  },
  {
    id: "sleep_guru",
    name: "Sleep Guru",
    description: "Use Sleep Analysis 30 times",
    category: "health",
  },
  {
    id: "nutrition_rookie",
    name: "Nutrition Rookie",
    description: "Use Nutrition Advisor 7 times",
    category: "health",
  },
  {
    id: "nutrition_expert",
    name: "Nutrition Expert",
    description: "Use Nutrition Advisor 30 times",
    category: "health",
  },
  {
    id: "healthy_care_master",
    name: "Healthy Care Master",
    description: "Use all 3 health features for 14 consecutive days",
    category: "health",
  },
  {
    id: "wellness_champion",
    name: "Wellness Champion",
    description: "Use all 3 health features for 30 consecutive days",
    category: "health",
  },

  // Finance Badges
  {
    id: "first_saver",
    name: "First Saver",
    description: "Add money to savings for the first time",
    category: "finance",
  },
  {
    id: "junior_accountant",
    name: "Junior Accountant",
    description: "Complete 1 saving target",
    category: "finance",
  },
  {
    id: "senior_accountant",
    name: "Senior Accountant",
    description: "Complete 3 saving targets",
    category: "finance",
  },
  {
    id: "financial_wizard",
    name: "Financial Wizard",
    description: "Complete 5 saving targets",
    category: "finance",
  },
  {
    id: "big_saver",
    name: "Big Saver",
    description: "Save a total of 1,000,000 (cumulative across all targets)",
    category: "finance",
  },

  // Todo Badges
  {
    id: "task_starter",
    name: "Task Starter",
    description: "Complete 10 tasks",
    category: "todo",
  },
  {
    id: "task_manager",
    name: "Task Manager",
    description: "Complete 50 tasks",
    category: "todo",
  },
  {
    id: "productivity_king",
    name: "Productivity King",
    description: "Complete 100 tasks",
    category: "todo",
  },
  {
    id: "zero_pending",
    name: "Zero Pending",
    description: "Have 0 pending tasks (min 5 tasks completed)",
    category: "todo",
  },

  // Habit Badges
  {
    id: "habit_beginner",
    name: "Habit Beginner",
    description: "Track all habits for 7 consecutive days",
    category: "habit",
  },
  {
    id: "habit_builder",
    name: "Habit Builder",
    description: "Track all habits for 30 consecutive days",
    category: "habit",
  },
  {
    id: "habit_legend",
    name: "Habit Legend",
    description: "Track all habits for 100 consecutive days",
    category: "habit",
  },
  {
    id: "habit_collector",
    name: "Habit Collector",
    description: "Have 10+ active habits",
    category: "habit",
  },

  // Streak Badges
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "7-day login streak",
    category: "streak",
  },
  {
    id: "monthly_devotee",
    name: "Monthly Devotee",
    description: "30-day login streak",
    category: "streak",
  },
  {
    id: "century_club",
    name: "Century Club",
    description: "100-day login streak",
    category: "streak",
  },
  {
    id: "year_of_commitment",
    name: "Year of Commitment",
    description: "365-day login streak",
    category: "streak",
  },

  // General Badges
  {
    id: "first_steps",
    name: "First Steps",
    description: "Complete profile setup (name, status, picture)",
    category: "general",
  },
  {
    id: "all_rounder",
    name: "All-Rounder",
    description: "Use all 4 main features at least once",
    category: "general",
  },
  {
    id: "rising_star",
    name: "Rising Star",
    description: "Reach Level 5",
    category: "general",
  },
  {
    id: "eduhabit_veteran",
    name: "EduHabit Veteran",
    description: "Reach Level 10",
    category: "general",
  },
  {
    id: "eduhabit_legend",
    name: "EduHabit Legend",
    description: "Reach Level 15",
    category: "general",
  },
  {
    id: "nexus_master",
    name: "Nexus Master",
    description: "Reach Level 20",
    category: "general",
  },
];

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES.filter((b) => b.category === category);
}
