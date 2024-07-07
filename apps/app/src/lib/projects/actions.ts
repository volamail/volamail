import { eq } from "drizzle-orm";
import { object, string } from "valibot";
import { createError } from "vinxi/http";
import { action, redirect } from "@solidjs/router";

import {
  deleteProjectWithCleanup,
  requireUserToBeMemberOfTeam,
  requireUserToBeMemberOfProject,
} from "./utils";
import { db } from "../db";
import { requireUser } from "../auth/utils";
import { projectsTable } from "../db/schema";
import { parseFormData } from "../server-utils";
import { getUserTeams } from "../teams/server-utils";

export const createProject = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    object({
      teamId: string(),
      name: string(),
    }),
    formData
  );

  await requireUserToBeMemberOfTeam({
    userId: user.id,
    teamId: payload.teamId,
  });

  const [{ insertedId: projectId }] = await db
    .insert(projectsTable)
    .values({
      teamId: payload.teamId,
      name: payload.name,
      creatorId: user.id,
    })
    .returning({ insertedId: projectsTable.id });

  throw redirect(`/t/${payload.teamId}/p/${projectId}/emails`);
});

export const deleteProject = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    object({
      id: string(),
    }),
    formData
  );

  await requireUserToBeMemberOfProject({
    projectId: payload.id,
    userId: user.id,
  });

  const userProjects = await getUserTeams(user.id);

  await deleteProjectWithCleanup(payload.id);

  const [projectToRedirectTo] = [
    ...(userProjects.personal ? [userProjects.personal] : []),
    ...userProjects.other,
  ]
    .flatMap((team) => team.projects)
    .filter((p) => p.id !== payload.id);

  if (!projectToRedirectTo) {
    throw createError({
      statusCode: 500,
      statusMessage: "User has no projects left to redirect to",
    });
  }

  throw redirect(
    `/t/${projectToRedirectTo.teamId}/p/${projectToRedirectTo.id}/emails`
  );
}, "projects");

export const editProject = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    object({
      id: string(),
      name: string(),
    }),
    formData
  );

  await requireUserToBeMemberOfProject({
    projectId: payload.id,
    userId: user.id,
  });

  await db
    .update(projectsTable)
    .set({
      name: payload.name,
    })
    .where(eq(projectsTable.id, payload.id));
}, "projects");
