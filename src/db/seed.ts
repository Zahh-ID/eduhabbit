import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { hashSync } from "bcryptjs";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL ?? "file:./eduhabit.db";
const dbPath = DATABASE_URL.startsWith("file:") ? DATABASE_URL.slice(5) : DATABASE_URL;

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

const userId = crypto.randomUUID();

db.insert(schema.users).values({
  id: userId,
  email: "user@eduhabit.dev",
  name: "Dev User",
  passwordHash: hashSync("password123", 10),
  locale: "en",
  theme: "dark",
}).run();

db.insert(schema.loginStreaks).values({
  userId,
  currentStreak: 1,
  longestStreak: 1,
  lastLoginDate: new Date().toISOString().split("T")[0],
  pointsAwardedToday: 0,
}).run();

console.log("Seeded user:");
console.log("  Email:    user@eduhabit.dev");
console.log("  Password: password123");

sqlite.close();
