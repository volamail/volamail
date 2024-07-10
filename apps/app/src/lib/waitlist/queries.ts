import { and, desc, eq, ilike } from "drizzle-orm";
import { cache } from "@solidjs/router";

import { db } from "../db";
import { waitlistTable } from "../db/schema";

export const searchWaitlist = cache(async (query: string) => {
  "use server";

  const users = await db.query.waitlistTable.findMany({
    where: and(
      eq(waitlistTable.approved, false),
      ilike(waitlistTable.email, `%${query}%`)
    ),
    limit: 10,
    orderBy: desc(waitlistTable.createdAt),
  });

  return users;
}, "waitlist");
