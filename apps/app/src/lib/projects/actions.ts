import { action, redirect } from "@solidjs/router";
import { parseAsync, object, string } from "valibot";

import { db } from "../db";
import { requireUser } from "../auth/utils";
import { projectsTable } from "../db/schema";
import { requireUserToBeMemberOfTeam } from "./utils";
import { parseFormData } from "../server-utils";

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
