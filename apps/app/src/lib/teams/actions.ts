import { createError } from "vinxi/http";
import { getRequestEvent } from "solid-js/web";
import { action, redirect } from "@solidjs/router";
import { object, parseAsync, string } from "valibot";

import { db } from "../db";
import { projectsTable, teamMembersTable, teamsTable } from "../db/schema";

export const createTeam = action(async (formData: FormData) => {
  "use server";

  const event = getRequestEvent()!;

  const user = event.locals.user;

  if (!user) {
    throw createError({
      statusCode: 401,
    });
  }

  const values = Object.fromEntries(formData);

  const payload = await parseAsync(
    object({
      name: string(),
    }),
    values
  );

  const { teamId, projectId } = await db.transaction(async (db) => {
    const [{ insertedId: teamId }] = await db
      .insert(teamsTable)
      .values(payload)
      .returning({ insertedId: teamsTable.id });

    const [, [{ insertedId: projectId }]] = await Promise.all([
      db.insert(teamMembersTable).values({
        teamId,
        userId: user.id,
      }),
      db
        .insert(projectsTable)
        .values({
          creatorId: user.id,
          teamId,
          name: "Untitled project",
        })
        .returning({ insertedId: projectsTable.id }),
    ]);

    return { teamId, projectId };
  });

  throw redirect(`/t/${teamId}/p/${projectId}/templates`);
});
