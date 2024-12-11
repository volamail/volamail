import { db } from "@/modules/database";
import {
	templateTranslationsTable,
	templatesTable,
} from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const deleteTemplateFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
				slug: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const { teamId, projectId, slug } = data;

		await db.transaction(async (db) => {
			await db
				.delete(templateTranslationsTable)
				.where(
					and(
						eq(templateTranslationsTable.teamId, teamId),
						eq(templateTranslationsTable.projectId, projectId),
						eq(templateTranslationsTable.templateSlug, slug),
					),
				);

			await db
				.delete(templatesTable)
				.where(
					and(
						eq(templatesTable.teamId, teamId),
						eq(templatesTable.projectId, projectId),
						eq(templatesTable.slug, slug),
					),
				);
		});
	});
