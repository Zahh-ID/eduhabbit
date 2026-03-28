import type { Config } from "drizzle-kit";

export default {
  dialect: "mysql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "mysql://eduhabit:password@localhost:3306/eduhabit",
  },
} satisfies Config;
