import { cache, redirect } from "@solidjs/router";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { teamInvitesTable, teamsTable } from "../db/schema";
import { createError } from "vinxi/http";
import { requireUser } from "../auth/utils";
import { User } from "lucia";

export const getTeam = cache(async (id: string) => {
  "use server";

  requireUser();

  const team = await db.query.teamsTable.findFirst({
    where: eq(teamsTable.id, id),
    with: {
      members: {
        with: {
          user: true,
        },
      },
      invites: true,
    },
  });

  if (!team) {
    throw createError({
      statusCode: 404,
      statusMessage: "Team not found",
    });
  }

  return team;
}, "teams");

export const getTeamInvite = cache(async (id: string) => {
  "use server";

  let user: User;

  try {
    user = requireUser();
  } catch {
    throw redirect(`/login?to=${`/join-team/${id}`}`);
  }

  const invite = await db.query.teamInvitesTable.findFirst({
    where: and(
      eq(teamInvitesTable.email, user.email),
      eq(teamInvitesTable.teamId, id)
    ),
    with: {
      team: true,
    },
  });

  if (!invite) {
    throw createError({
      statusCode: 404,
      statusMessage: "Invite not found",
    });
  }

  return invite;
}, "team-invite");
