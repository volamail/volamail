import { db } from "@/modules/database";
import { templatesTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { renderTemplateToText } from "../render";

export const getProjectTemplatesFn = createServerFn({ method: "GET" })
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
		const rows = await db.query.templatesTable.findMany({
			where: and(
				eq(templatesTable.teamId, data.teamId),
				eq(templatesTable.projectId, data.projectId),
			),
			with: {
				translations: {
					columns: {
						language: true,
					},
				},
				defaultTranslation: {
					columns: {
						subject: true,
						contents: true,
					},
				},
			},
			orderBy: desc(templatesTable.modifiedAt),
		});

		return rows.map(({ translations, ...row }) => ({
			...row,
			createdAt: row.createdAt.toISOString(),
			modifiedAt: row.modifiedAt.toISOString(),
			translationCount: translations.length,
			defaultTranslation: {
				subject: row.defaultTranslation.subject,
				contents: renderTemplateToText({
					contents: row.defaultTranslation.contents,
					theme: row.theme,
				}),
			},
		}));
	});
