import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { getRequestEvent } from "solid-js/web";
import { action, redirect } from "@solidjs/router";
import { email, object, parseAsync, pipe, string } from "valibot";

import {
  teamsTable,
  projectsTable,
  teamMembersTable,
  teamInvitesTable,
  subscriptionsTable,
} from "../db/schema";
import { db } from "../db";
import { env } from "../env";
import { sendMail } from "../mail/send";
import { requireUser } from "../auth/utils";
import { requireUserToBeMemberOfTeam } from "../projects/utils";
import { SUBSCRIPTION_QUOTAS } from "../subscriptions/constants";
import teamInviteTemplate from "~/lib/static-templates/team-invite.html?raw";

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

export const inviteTeamMember = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const values = Object.fromEntries(formData);

  const payload = await parseAsync(
    object({
      teamId: string(),
      email: pipe(string(), email()),
    }),
    values
  );

  const { meta } = await requireUserToBeMemberOfTeam({
    userId: user.id,
    teamId: payload.teamId,
  });

  await db.insert(teamInvitesTable).values({
    teamId: payload.teamId,
    email: payload.email,
  });

  await sendMail({
    from: "noreply@volamail.com",
    to: payload.email,
    subject: `You've been invited to join ${meta.team.name}`,
    body: teamInviteTemplate,
    data: {
      team_name: meta.team.name,
      link: import.meta.env.DEV
        ? `http://localhost:3000/join-team/${meta.team.id}`
        : `https://${env.SITE_URL}/join-team/${meta.team.id}`,
    },
  });
}, "invites");

export const acceptInvite = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const values = Object.fromEntries(formData);

  const payload = await parseAsync(
    object({
      teamId: string(),
    }),
    values
  );

  const invite = await db.query.teamInvitesTable.findFirst({
    where: and(
      eq(teamInvitesTable.teamId, payload.teamId),
      eq(teamInvitesTable.email, user.email)
    ),
  });

  if (!invite) {
    throw createError({
      statusCode: 404,
      statusMessage: "Invite not found",
    });
  }

  if (Date.now() - invite.createdAt.getTime() > 48 * 60 * 60 * 1000) {
    throw createError({
      statusCode: 403,
      statusMessage: "Invite expired",
    });
  }

  await db.transaction(async (db) => {
    await db
      .delete(teamInvitesTable)
      .where(
        and(
          eq(teamInvitesTable.teamId, payload.teamId),
          eq(teamInvitesTable.email, user.email)
        )
      );

    await db.insert(teamMembersTable).values({
      teamId: payload.teamId,
      userId: user.id,
    });
  });

  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.teamId, payload.teamId),
  });

  if (!project) {
    throw createError({
      statusCode: 500,
      statusMessage: "Team doesn't have a project",
    });
  }

  throw redirect(`/t/${payload.teamId}/p/${project.id}/emails`);
});

export const deleteInvite = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const values = Object.fromEntries(formData);

  const payload = await parseAsync(
    object({
      teamId: string(),
      email: string(),
    }),
    values
  );

  await requireUserToBeMemberOfTeam({
    userId: user.id,
    teamId: payload.teamId,
  });

  await db
    .delete(teamInvitesTable)
    .where(
      and(
        eq(teamInvitesTable.teamId, payload.teamId),
        eq(teamInvitesTable.email, payload.email)
      )
    );

  return {
    success: true,
  };
}, "invites");
