import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../lib/db";
import { sources } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const errs = await db.select({
    url: sources.rawUrl,
    error: sources.errorMessage
  }).from(sources).where(eq(sources.status, "error"));
  console.log("DB Errors:", errs);
  process.exit(0);
}
main();
