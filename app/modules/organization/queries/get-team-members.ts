import { db } from "@/modules/database";
import { teamMembersTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getTeamMembersFn = createServerFn({ method: "GET" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const members = await db.query.teamMembersTable.findMany({
			where: eq(teamMembersTable.teamId, data.teamId),
			with: {
				user: true,
			},
		});

		return members.map((member) => ({
			...member,
			joinedAt: member.joinedAt.toISOString(),
		}));
	});
