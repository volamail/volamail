import { db } from "@/modules/database";
import { projectsTable } from "@/modules/database/schema";
import { err, ok } from "@/modules/rpcs/errors";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import slugify from "slugify";
import { z } from "zod";

export const createProjectFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				id: z
					.string()
					.trim()
					.min(3)
					.max(32)
					.refine((id) => slugify(id, { lower: true, strict: true }) === id),
				name: z.string().trim().min(3).max(32),
				teamId: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const teamProjects = await db.query.projectsTable.findMany({
			where: eq(projectsTable.teamId, data.teamId),
		});

		if (teamProjects.length >= 3) {
			return err("PROJECT_LIMIT_REACHED" as const);
		}

		const existing = teamProjects.find((project) => project.id === data.id);

		if (existing) {
			return err("PROJECT_ID_USED" as const);
		}

		await db.insert(projectsTable).values({
			id: data.id,
			name: data.name,
			teamId: data.teamId,
		});

		return ok({
			id: data.id,
		});
	});
