import { db } from "@/modules/database";
import { teamsTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { z } from "zod";

export const getTeamFn = createServerFn({ method: "GET" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const team = await db.query.teamsTable.findFirst({
			where: eq(teamsTable.id, data.teamId),
			with: {
				subscription: true,
				projects: true,
			},
		});

		if (!team) {
			throw createError({
				status: 404,
				message: "Team not found",
			});
		}

		return team;
	});
