import { db } from "@/modules/database";
import {
	teamInvitesTable,
	teamMembersTable,
	teamsTable,
} from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { z } from "zod";
import { deleteProject } from "../projects";

export const deleteTeamFn = createServerFn({
	method: "POST",
})
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
			}),
		),
	)
	.handler(async ({ data, context }) => {
		const { teamId } = data;
		const { user } = context;

		const userTeams = await db.query.teamMembersTable.findMany({
			where: eq(teamMembersTable.userId, user.id),
			with: {
				team: {
					with: {
						projects: true,
					},
				},
			},
		});

		if (userTeams.length === 1) {
			throw createError({
				status: 400,
				statusMessage: "can't delete last team",
			});
		}

		const team = await db.query.teamsTable.findFirst({
			where: eq(teamsTable.id, teamId),
			with: {
				projects: true,
			},
		});

		if (!team) {
			throw createError({
				status: 404,
				statusMessage: "team not found",
			});
		}

		await db.transaction(async (db) => {
			// Delete domains
			for (const project of team.projects) {
				await deleteProject(teamId, project.id);
			}

			// Delete team members
			await db
				.delete(teamMembersTable)
				.where(eq(teamMembersTable.teamId, teamId));

			// Delete team invites
			await db
				.delete(teamInvitesTable)
				.where(eq(teamInvitesTable.teamId, teamId));

			// Delete team
			await db.delete(teamsTable).where(eq(teamsTable.id, teamId));
		});

		const teamToRedirectTo = userTeams.filter((t) => t.teamId !== teamId)[0];

		return {
			teamToRedirectToId: teamToRedirectTo.teamId,
			projectToRedirectToId: teamToRedirectTo.team.projects[0].id,
		};
	});
