import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { getRequestEvent } from "solid-js/web";
import { cache, redirect } from "@solidjs/router";

import { db } from "../db";
import { projectsTable, teamsTable } from "../db/schema";
import { getUserProjects as queryGetUserProjects } from "./utils";

export const getUserProjects = cache(async () => {
  "use server";

  const event = getRequestEvent()!;

  const user = event.locals.user;

  if (!user) {
    throw createError({
      status: 401,
    });
  }

  return await queryGetUserProjects(user.id);
}, "projects");

export const getTeamDefaultProject = cache(async (teamId: string) => {
  "use server";

  const event = getRequestEvent()!;

  const user = event.locals.user;

  if (!user) {
    throw redirect("/login");
  }

  return await db.query.projectsTable.findFirst({
    where: and(eq(projectsTable.teamId, teamId)),
  });
}, "projects:default");

export const getCurrentUserDefaultProject = cache(async () => {
  "use server";

  const event = getRequestEvent()!;

  const user = event.locals.user;

  if (!user) {
    return null;
  }

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
