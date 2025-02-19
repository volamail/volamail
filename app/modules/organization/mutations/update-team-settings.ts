import { db } from "@/modules/database";
import { teamsTable } from "@/modules/database/schema";
import { err, ok } from "@/modules/rpcs/errors";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import slugify from "slugify";
import { createError } from "vinxi/http";
import { z } from "zod";

export const updateTeamSettingsFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
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
		const { teamId, settings } = data;

		const team = await db.query.teamsTable.findFirst({
			where: eq(teamsTable.id, teamId),
		});

		if (!team) {
			throw createError({
				status: 404,
				statusMessage: "team not found",
			});
		}

		if (team.id === settings.id) {
			await db
				.update(teamsTable)
				.set({
					name: settings.name,
				})
				.where(eq(teamsTable.id, teamId));

			return ok({
				updates: {
					name: settings.name,
				},
			});
		}

		const existing = await db.query.teamsTable.findFirst({
			where: eq(teamsTable.id, settings.id),
		});

		if (existing) {
			return err("TEAM_ID_TAKEN");
		}

		await db
			.update(teamsTable)
			.set({
				id: settings.id,
				name: settings.name,
			})
			.where(eq(teamsTable.id, teamId));

		return ok({
			updates: {
				id: settings.id,
				name: settings.name,
			} as const,
		});
	});
