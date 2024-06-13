import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { getRequestEvent } from "solid-js/web";
import { cache, redirect } from "@solidjs/router";

import { db } from "../db";
import { projectsTable } from "../db/schema";
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
