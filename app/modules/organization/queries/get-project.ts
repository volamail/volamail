import { db } from "@/modules/database";
import { projectsTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { z } from "zod";

export const getProjectFn = createServerFn({ method: "GET" })
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
		const project = await db.query.projectsTable.findFirst({
			where: and(
				eq(projectsTable.teamId, data.teamId),
				eq(projectsTable.id, data.projectId),
			),
		});

		if (!project) {
			throw createError({
				status: 404,
				statusMessage: "Project not found",
			});
		}

		return project;
	});
