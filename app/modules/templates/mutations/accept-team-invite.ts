import { db } from "@/modules/database";
import { teamInvitesTable, teamMembersTable } from "@/modules/database/schema";
import { authenticationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { compareAsc } from "date-fns";
import { eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { z } from "zod";

export const acceptTeamInviteFn = createServerFn({ method: "POST" })
	.middleware([authenticationMiddleware])
	.validator(
		zodValidator(
			z.object({
				code: z.string(),
			}),
		),
	)
	.handler(async ({ data, context }) => {
		const { user } = context;

		const invite = await db.query.teamInvitesTable.findFirst({
			where: eq(teamInvitesTable.code, data.code),
			with: {
				team: {
					with: {
						projects: {
							columns: {
								id: true,
							},
						},
					},
				},
			},
		});

		if (!invite) {
			throw createError({
				status: 404,
				message: "Invite not found",
			});
		}

		if (compareAsc(new Date(), invite.expiresAt) === 1) {
			throw createError({
				status: 400,
				message: "Invite expired",
			});
		}

		await db.transaction(async (db) => {
			await db
				.delete(teamInvitesTable)
				.where(eq(teamInvitesTable.code, data.code));

			await db
				.insert(teamMembersTable)
				.values({
					teamId: invite.teamId,
					userId: user.id,
				})
				.onConflictDoNothing();
		});

		const defaultProject = invite.team.projects[0];

		if (!defaultProject) {
			throw createError({
				status: 500,
				message: "Team has no projects",
			});
		}

		return {
			teamId: invite.teamId,
			projectId: defaultProject.id,
		};
	});
