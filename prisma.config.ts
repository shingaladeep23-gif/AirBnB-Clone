import path from "node:path";
import { defineConfig } from "prisma/config";

/*
  DATABASE_URL is DEFAULTED, not required, and the default is ABSOLUTE.

  Both halves of that matter.

  *Defaulted*, because the whole reason for choosing committed SQLite over hosted
  Postgres was that a reviewer can clone, `npm install`, and run — no credentials,
  no .env, no cloud account. Requiring an env var to locate a file that is already
  in the repo would give that away for nothing.

  *Absolute*, because a RELATIVE sqlite URL is resolved differently by the two
  consumers, and the failure is silent. The Prisma CLI resolves it against this
  config file; the query engine resolves it against `process.cwd()`, which differs
  between `next dev`, `next build`, `next start` and the seed script. A project
  that writes `file:./dev.db` therefore ends up with TWO database files — a seeded
  one the CLI wrote and an empty one the server created — and every query fails
  with "table does not exist" against a database that visibly has tables. This
  project hit exactly that. Joining on cwd once, here and in `lib/db.ts`, makes
  every consumer agree.
*/
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env["DATABASE_URL"] ??
      `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
  },
});
