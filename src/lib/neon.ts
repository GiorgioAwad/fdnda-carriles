import "server-only";

import { neon } from "@neondatabase/serverless";
import { hasDatabaseEnv } from "@/lib/env";

let sqlClient: ReturnType<typeof neon> | null = null;

export function getNeonSql() {
  if (!hasDatabaseEnv) {
    return null;
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL!);
  }

  return sqlClient;
}
