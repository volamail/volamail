import { db } from "@/modules/database";
import { teamMembersTable } from "@/modules/database/schema";
import { authenticationMiddleware } from "@/modules/rpcs/server-functions";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";

export const getUserTeamsFn = createServerFn({ method: "GET" })
	.middleware([authenticationMiddleware])
	.handler(async ({ context }) => {
		const { user } = context;

		const teamMemberRows = await db.query.teamMembersTable.findMany({
			where: eq(teamMembersTable.userId, user.id),
			with: {
				team: {
					with: {
						projects: true,
					},
				},
			},
		});

		return teamMemberRows.map(({ team }) => team);
	});
