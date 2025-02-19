import { db } from "@/modules/database";
import { projectsTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import slugify from "slugify";
import { createError } from "vinxi/http";
import { z } from "zod";

export const updateProjectSettingsFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
				settings: z.object({
					id: z
						.string()
						.max(32)
						.refine((id) => slugify(id, { strict: true, lower: true }) === id),
					name: z.string().max(32),
				}),
			}),
		),
	)
	.handler(async ({ data }) => {
		const { teamId, projectId, settings } = data;

		const project = await db.query.projectsTable.findFirst({
			where: and(
				eq(projectsTable.teamId, teamId),
				eq(projectsTable.id, projectId),
			),
		});

		if (!project) {
			throw createError({
				status: 404,
				statusMessage: "Project not found",
			});
		}

		if (project.id === settings.id) {
			await db
				.update(projectsTable)
				.set({
					name: settings.name,
				})
				.where(
					and(
						eq(projectsTable.teamId, teamId),
						eq(projectsTable.id, projectId),
					),
				);

			return {
				updates: {
					name: settings.name,
				},
			};
		}

		const existing = await db.query.projectsTable.findFirst({
			where: and(
				eq(projectsTable.teamId, teamId),
				eq(projectsTable.id, settings.id),
			),
		});

		if (existing) {
			throw createError({
				status: 400,
				statusMessage: "team already has a project with this ID",
			});
		}

		await db
			.update(projectsTable)
			.set({
				id: settings.id,
				name: settings.name,
			})
			.where(
				and(eq(projectsTable.teamId, teamId), eq(projectsTable.id, projectId)),
			);

		return {
			updates: {
				id: settings.id,
				name: settings.name,
			},
		};
	});
