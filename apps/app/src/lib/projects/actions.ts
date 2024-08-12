import * as v from "valibot";
import { eq } from "drizzle-orm";
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
import { getUserTeams } from "../teams/queries";

export const createProject = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    v.object({
      teamId: v.string(),
      name: v.string(),
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
    })
    .returning({ insertedId: projectsTable.id });

  throw redirect(`/t/${payload.teamId}/p/${projectId}/emails`);
});

export const deleteProject = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    v.object({
      id: v.string(),
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
    v.object({
      id: v.string(),
      name: v.pipe(
        v.string(),
        v.minLength(2, "Name is too short"),
        v.maxLength(64, "Name is too long")
      ),
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

export const editProjectContext = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    v.object({
      projectId: v.string(),
      context: v.pipe(v.string(), v.maxLength(200)),
    }),
    formData
  );

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: payload.projectId,
  });

  await db
    .update(projectsTable)
    .set({
      context: payload.context,
    })
    .where(eq(projectsTable.id, payload.projectId));
});
