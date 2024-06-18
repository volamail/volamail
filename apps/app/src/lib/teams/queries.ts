import { cache } from "@solidjs/router";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { teamsTable } from "../db/schema";
import { createError } from "vinxi/http";
import { requireUser } from "../auth/utils";

export const getTeam = cache(async (id: string) => {
  "use server";

  requireUser();

  const team = await db.query.teamsTable.findFirst({
    where: eq(teamsTable.id, id),
  });

  if (!team) {
    throw createError({
      statusCode: 404,
      statusMessage: "Team not found",
    });
  }

  return team;
}, "teams");
