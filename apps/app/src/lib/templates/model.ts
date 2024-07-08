import { anthropic } from "@ai-sdk/anthropic";
import { eq } from "drizzle-orm";
import { teamsTable } from "../db/schema";
import { db } from "../db";

export async function getModelForTeam(teamId: string) {
  const team = await db.query.teamsTable.findFirst({
    where: eq(teamsTable.id, teamId),
    with: {
      subscription: {
        columns: {
          tier: true,
        },
      },
    },
    columns: {},
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.subscription.tier === "FREE") {
    return anthropic("claude-3-haiku-20240307");
  }

  return anthropic("claude-3-sonnet-20240229");
}
