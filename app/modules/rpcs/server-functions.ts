import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { getSessionCookie } from "../auth/cookies";
import { validateSessionToken } from "../auth/sessions";
import { db } from "../database";
import { teamMembersTable } from "../database/schema";

export const authenticationMiddleware = createMiddleware().server(
	async ({ next }) => {
		const sessionToken = getSessionCookie();

		if (!sessionToken) {
			throw redirect({
				to: "/login",
			});
		}

		const { session, user } = await validateSessionToken(sessionToken);

		if (!session || !user) {
			throw redirect({
				to: "/login",
			});
		}

		return next({
			context: {
				user,
			},
		});
	},
);

export const teamAuthorizationMiddleware = createMiddleware()
	.middleware([authenticationMiddleware])
	.validator((data: { teamId: string }) => data)
	.server(async ({ next, data, context }) => {
		const { teamId } = data;

		const member = await db.query.teamMembersTable.findFirst({
			where: and(
				eq(teamMembersTable.teamId, teamId),
				eq(teamMembersTable.userId, context.user.id),
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
