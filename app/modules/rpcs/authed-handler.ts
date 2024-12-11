import { redirect } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import type { z } from "zod";
import type { Authorization } from "../auth/authorizations";
import { getSessionCookie } from "../auth/cookies";
import { validateSessionToken } from "../auth/sessions";
import type { UserWithTeams } from "../auth/types";
import { db } from "../database";
import { teamMembersTable } from "../database/schema";
import { logger } from "../logger";

export function createAuthedServerFnHandler<
	Schema extends z.AnyZodObject,
	Return,
>(options: {
	schema?: Schema;
	authorization: Authorization<{
		params: Schema extends z.AnyZodObject ? z.infer<Schema> : null;
		user: UserWithTeams;
	}> | null;
	handler: (context: {
		params: Schema extends z.AnyZodObject ? z.infer<Schema> : null;
		user: UserWithTeams;
	}) => Promise<Return>;
}) {
	return async (
		params: Schema extends z.AnyZodObject ? z.infer<Schema> : never,
	) => {
		const { schema } = options;

		let validatedParams = null as Schema extends z.AnyZodObject
			? z.infer<Schema>
			: null;

		if (schema) {
			const validationResult = await schema.safeParseAsync(params);

			if (!validationResult.success) {
				throw createError({
					status: 400,
					statusMessage: "validation failed",
				});
			}

			// @ts-expect-error - should be safe
			validatedParams = validationResult.data;
		}

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

		const teamMemberRows = await db.query.teamMembersTable.findMany({
			where: eq(teamMembersTable.userId, user.id),
			with: {
				team: true,
			},
		});

		try {
			return await options.handler({
				params: validatedParams,
				user: {
					...user,
					teams: teamMemberRows.map((row) => row.team),
				},
			});
		} catch (err) {
			logger.error("Server fn handler error", err);

			throw err;
		}
	};
}
