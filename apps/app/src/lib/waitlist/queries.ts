import { and, desc, eq, ilike } from "drizzle-orm";
import { cache } from "@solidjs/router";
import { createError } from "vinxi/http";

import { db } from "../db";
import { waitlistTable } from "../db/schema";
import { env } from "../environment/env";

export const searchWaitlist = cache(async (query: string) => {
  "use server";

  if (env.VITE_SELF_HOSTED === "true") {
    throw createError({
      status: 404,
      statusMessage: "Not found",
    });
  }

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
