import { eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { getRequestEvent } from "solid-js/web";
import { action, redirect } from "@solidjs/router";
import { object, parseAsync, string } from "valibot";

import {
  teamsTable,
  projectsTable,
  teamMembersTable,
  subscriptionsTable,
} from "../db/schema";
import { db } from "../db";
import { requireUser } from "../auth/utils";
import { requireUserToBeMemberOfTeam } from "../projects/utils";
import { SUBSCRIPTION_QUOTAS } from "../subscriptions/constants";

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
    const [{ insertedId: subscriptionId }] = await db
      .insert(subscriptionsTable)
      .values({
        tier: "FREE",
        monthlyQuota: SUBSCRIPTION_QUOTAS["FREE"],
        periodType: "MONTHLY",
        lastRefilledAt: new Date(),
        price: "0.00",
        remainingQuota: SUBSCRIPTION_QUOTAS["FREE"],
        renewsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        status: "ACTIVE",
      })
      .returning({ insertedId: subscriptionsTable.id });

    const [{ insertedId: teamId }] = await db
      .insert(teamsTable)
      .values({
        ...payload,
        subscriptionId,
      })
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

  throw redirect(`/t/${teamId}/p/${projectId}/emails`);
});

export const editTeam = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const values = Object.fromEntries(formData);

  const payload = await parseAsync(
    object({
      id: string(),
      name: string(),
    }),
    values
  );

  await requireUserToBeMemberOfTeam({
    userId: user.id,
    teamId: payload.id,
  });

  await db
    .update(teamsTable)
    .set({
      name: payload.name,
    })
    .where(eq(teamsTable.id, payload.id));
});
