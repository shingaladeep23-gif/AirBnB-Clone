import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * The Prisma client, as a process-wide singleton.
 *
 * WHY A GLOBAL: Next's dev server hot-reloads modules on every edit. A plain
 * module-level `new PrismaClient()` therefore opens a fresh connection pool per
 * reload and eventually exhausts the database's handles — the single most common
 * way a Prisma + Next app falls over locally. Stashing it on `globalThis` (which
 * survives module reload) is the standard fix; production creates it exactly once
 * either way, so the branch costs nothing there.
 *
 * WHY AN ABSOLUTE PATH: a `file:./prisma/dev.db` URL resolves against the process
 * working directory, which is not the same for `next dev`, `next build` and a
 * serverless bundle. Anchoring on cwd once, here, keeps every caller honest.
 */

const databaseUrl =
  process.env["DATABASE_URL"] ??
  `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
