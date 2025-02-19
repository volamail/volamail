import { db } from "@/modules/database";
import { projectsTable } from "@/modules/database/schema";
import { deleteProject as deleteProjectProcedure } from "@/modules/organization/projects";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { z } from "zod";

export const deleteProjectFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const teamProjects = await db.query.projectsTable.findMany({
			where: eq(projectsTable.teamId, data.teamId),
		});

		if (teamProjects.length === 1) {
			throw createError({
				status: 400,
				statusMessage: "can't delete last project for team",
			});
		}

		await deleteProjectProcedure(data.teamId, data.projectId);

		const projectToRedirectTo = teamProjects.filter(
			(p) => p.id !== data.projectId,
		)[0];

		return {
			projectToRedirectToId: projectToRedirectTo.id,
		};
	});
