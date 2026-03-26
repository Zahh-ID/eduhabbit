import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL ?? "file:./eduhabit.db";

// Strip the "file:" prefix that SQLite URL format uses
const dbPath = DATABASE_URL.startsWith("file:")
  ? DATABASE_URL.slice(5)
  : DATABASE_URL;

const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export type DB = typeof db;
