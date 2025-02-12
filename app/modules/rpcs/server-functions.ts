import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { createError, getWebRequest } from "vinxi/http";
import { auth } from "../auth/auth";
import { db } from "../database";
import { teamMembersTable, usersTable } from "../database/schema";

export const authenticationMiddleware = createMiddleware().server(
  async ({ next }) => {
    const request = getWebRequest();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const url = new URL(request.url);

    if (!session) {
      throw redirect({
        to: "/login",
        search: {
          next: url.pathname !== "/" ? url.pathname : undefined,
        },
      });
    }

    const userWithTeams = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
      with: {
        teams: true,
      },
    });

    if (!userWithTeams) {
      throw redirect({
        to: "/login",
        search: {
          next: url.pathname !== "/" ? url.pathname : undefined,
        },
      });
    }

    return next({
      context: {
        user: userWithTeams,
      },
    });
  }
);

export const teamAuthorizationMiddleware = createMiddleware()
  .middleware([authenticationMiddleware])
  .validator((data: { teamId: string }) => data)
  .server(async ({ next, data, context }) => {
    const { teamId } = data;

    const member = await db.query.teamMembersTable.findFirst({
      where: and(
        eq(teamMembersTable.teamId, teamId),
        eq(teamMembersTable.userId, context.user.id)
      ),
    });

    if (!member) {
      throw createError({
        status: 403,
        statusMessage: "not authorized",
      });
    }

    return next();
  });
