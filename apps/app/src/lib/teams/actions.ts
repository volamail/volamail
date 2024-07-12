import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { getRequestEvent } from "solid-js/web";
import { action, redirect } from "@solidjs/router";
import { email, object, pipe, string } from "valibot";

import {
  teamsTable,
  projectsTable,
  teamMembersTable,
  teamInvitesTable,
  subscriptionsTable,
} from "../db/schema";
import { db } from "../db";
import { env } from "../environment/env";
import { sendMail } from "../mail/send";
import { requireUser } from "../auth/utils";
import { parseFormData } from "../server-utils";
import {
  deleteProjectWithCleanup,
  requireUserToBeMemberOfTeam,
} from "../projects/utils";
import {
  SUBSCRIPTION_QUOTAS,
  SUBSCRIPTION_TYPE_FREE,
} from "../subscriptions/constants";
import teamInviteTemplate from "~/lib/static-templates/team-invite.html?raw";
import { DateTime } from "luxon";

export const createTeam = action(async (formData: FormData) => {
  "use server";

  const event = getRequestEvent()!;

  const user = event.locals.user;

  if (!user) {
    throw createError({
      statusCode: 401,
    });
  }

  const payload = await parseFormData(
    object({
      name: string(),
    }),
    formData
  );

  const { teamId, projectId } = await db.transaction(async (db) => {
    const [{ insertedId: subscriptionId }] = await db
      .insert(subscriptionsTable)
      .values({
        tier: SUBSCRIPTION_TYPE_FREE,
        remainingQuota: SUBSCRIPTION_QUOTAS[SUBSCRIPTION_TYPE_FREE].emails,
        monthlyQuota: SUBSCRIPTION_QUOTAS[SUBSCRIPTION_TYPE_FREE].emails,
        periodType: "MONTHLY",
        lastRefilledAt: DateTime.now().toJSDate(),
        storageQuota: SUBSCRIPTION_QUOTAS[SUBSCRIPTION_TYPE_FREE].storage,
        price: "0.00",
        renewsAt: DateTime.now().plus({ days: 30 }).toJSDate(),
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

  const payload = await parseFormData(
    object({
      id: string(),
      name: string(),
    }),
    formData
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
}, "team");

export const inviteTeamMember = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    object({
      teamId: string(),
      email: pipe(string(), email()),
    }),
    formData
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
    from: env.NOREPLY_EMAIL,
    to: payload.email,
    subject: `You've been invited to join ${meta.team.name}`,
    body: teamInviteTemplate,
    data: {
      team_name: meta.team.name,
      link: import.meta.env.DEV
        ? `http://localhost:3000/join-team/${meta.team.id}`
        : `https://${env.SITE_DOMAIN}/join-team/${meta.team.id}`,
    },
  });
}, "invites");

export const acceptInvite = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    object({
      teamId: string(),
    }),
    formData
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

  const payload = await parseFormData(
    object({
      teamId: string(),
      email: string(),
    }),
    formData
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

export const deleteMember = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    object({
      teamId: string(),
      userId: string(),
    }),
    formData
  );

  await requireUserToBeMemberOfTeam({
    userId: user.id,
    teamId: payload.teamId,
  });

  await db
    .delete(teamMembersTable)
    .where(
      and(
        eq(teamMembersTable.teamId, payload.teamId),
        eq(teamMembersTable.userId, payload.userId)
      )
    );

  return {
    success: true,
  };
}, "members");

export const deleteTeam = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    object({
      id: string(),
    }),
    formData
  );

  await requireUserToBeMemberOfTeam({
    userId: user.id,
    teamId: payload.id,
  });

  const projects = await db.query.projectsTable.findMany({
    where: eq(projectsTable.teamId, payload.id),
  });

  await db.transaction(async (db) => {
    await Promise.all(
      projects.map((project) => deleteProjectWithCleanup(project.id))
    );

    await db.delete(teamsTable).where(eq(teamsTable.id, payload.id));
  });

  throw redirect("/teams");
}, "teams");
