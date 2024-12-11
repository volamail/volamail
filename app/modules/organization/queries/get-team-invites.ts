import { db } from "@/modules/database";
import { teamInvitesTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { compareAsc } from "date-fns";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getTeamInvitesFn = createServerFn({ method: "GET" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const invites = await db.query.teamInvitesTable.findMany({
			where: eq(teamInvitesTable.teamId, data.teamId),
		});

		return invites.map((invite) => ({
			...invite,
			createdAt: invite.createdAt.toISOString(),
			expiresAt: invite.expiresAt.toISOString(),
			status:
				compareAsc(new Date(), invite.expiresAt) === 1 ? "expired" : "pending",
		}));
	});
