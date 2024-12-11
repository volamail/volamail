import { db } from "@/modules/database";
import { teamInvitesTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const revokeTeamInviteFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				email: z.string().email(),
			}),
		),
	)
	.handler(async ({ data }) => {
		await db
			.delete(teamInvitesTable)
			.where(
				and(
					eq(teamInvitesTable.teamId, data.teamId),
					eq(teamInvitesTable.email, data.email),
				),
			);
	});
