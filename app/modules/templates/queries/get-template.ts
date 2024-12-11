import { db } from "@/modules/database";
import { templatesTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import * as R from "remeda";
import { createError } from "vinxi/http";
import { z } from "zod";

export const getTemplateFn = createServerFn({ method: "GET" })
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
		const row = await db.query.templatesTable.findFirst({
			where: and(
				eq(templatesTable.teamId, data.teamId),
				eq(templatesTable.projectId, data.projectId),
				eq(templatesTable.slug, data.slug),
			),
			with: {
				translations: true,
				defaultTranslation: true,
			},
		});

		if (!row) {
			throw createError({
				status: 404,
				statusMessage: "Template not found",
			});
		}

		return {
			...row,
			createdAt: row.createdAt.toISOString(),
			modifiedAt: row.modifiedAt.toISOString(),
			translations: R.pipe(
				row.translations,
				R.indexBy((r) => r.language),
				R.omit([row.defaultTranslationLanguage]),
			),
		};
	});
