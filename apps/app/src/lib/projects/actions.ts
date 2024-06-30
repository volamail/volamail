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

  const [project, userProjects] = await Promise.all([
    db.query.projectsTable.findFirst({
      where: eq(projectsTable.id, payload.id),
      with: {
        images: true,
        domains: true,
      },
    }),
    getUserProjects(user.id),
  ]);

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: "Project not found",
    });
  }

  await db.transaction(async (db) => {
    await Promise.all([
      db.delete(projectsTable).where(eq(projectsTable.id, payload.id)),
      project.images.length > 0 &&
        s3.deleteObjects({
          Bucket: env.AWS_BUCKET,
          Delete: {
            Objects: project.images.map((image) => ({
              Key: `media/${image.id}`,
            })),
          },
        }),
      Promise.all(
        project.domains.map((domain) =>
          sesClient.deleteEmailIdentity({
            EmailIdentity: domain.domain,
          })
        )
      ),
    ]);
  });

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
