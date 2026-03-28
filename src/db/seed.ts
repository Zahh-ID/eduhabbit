import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { hashSync } from "bcryptjs";
import * as schema from "./schema";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "mysql://eduhabit:password@localhost:3306/eduhabit";

const pool = mysql.createPool({ uri: DATABASE_URL });
const db = drizzle(pool, { schema, mode: "default" });

const userId = crypto.randomUUID();

async function seed() {
  await db.insert(schema.users).values({
    id: userId,
    email: "user@eduhabit.dev",
    name: "Dev User",
    passwordHash: hashSync("password123", 10),
    locale: "en",
    theme: "dark",
  });

  await db.insert(schema.loginStreaks).values({
    userId,
    currentStreak: 1,
    longestStreak: 1,
    lastLoginDate: new Date().toISOString().split("T")[0],
    pointsAwardedToday: 0,
  });

  console.log("Seeded user:");
  console.log("  Email:    user@eduhabit.dev");
  console.log("  Password: password123");

  await pool.end();
}

seed().catch(console.error);
