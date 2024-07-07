import { cache } from "@solidjs/router";
import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";

import { db } from "../db";
import { requireUser } from "../auth/utils";
import { requireUserToBeMemberOfTeam } from "./utils";
import { projectsTable, teamsTable } from "../db/schema";

export const getTeamDefaultProject = cache(async (teamId: string) => {
  "use server";

  requireUser();

  return await db.query.projectsTable.findFirst({
    where: and(eq(projectsTable.teamId, teamId)),
  });
}, "projects:default");

export const getCurrentUserDefaultProject = cache(async () => {
  "use server";

  const user = requireUser();

  const personalTeam = await db.query.teamsTable.findFirst({
    where: eq(teamsTable.id, user.personalTeamId),
    with: {
      projects: true,
    },
  });

  const project = personalTeam?.projects[0];

  if (!project) {
    // TODO: Maybe create a default project here
    throw createError({
      statusCode: 500,
      statusMessage: "No user project found",
    });
  }

  return project;
}, "default-project");

export const getProject = cache(
  async ({ teamId, projectId }: { teamId: string; projectId: string }) => {
    "use server";

    const user = requireUser();

    await requireUserToBeMemberOfTeam({
      userId: user.id,
      teamId: teamId,
    });

    return await db.query.projectsTable.findFirst({
      where: and(
        eq(projectsTable.teamId, teamId),
        eq(projectsTable.id, projectId)
      ),
    });
  },
  "project"
);
