import { action, redirect } from "@solidjs/router";
import { object, parseAsync, string } from "valibot";
import { createError } from "vinxi/http";

import { eq } from "drizzle-orm";
import { requireUser } from "../auth/utils";
import { db } from "../db";
import { projectsTable } from "../db/schema";
import { env } from "../env";
import { sesClient } from "../mail/send";
import { s3 } from "../media/server-utils";
import { parseFormData } from "../server-utils";
import {
  deleteProjectWithCleanup,
  getUserProjects,
  requireUserToBeMemberOfProject,
  requireUserToBeMemberOfTeam,
} from "./utils";

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

  const userProjects = await getUserProjects(user.id);

  await deleteProjectWithCleanup(payload.id);

  const [projectToRedirectTo] = userProjects.teams
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
