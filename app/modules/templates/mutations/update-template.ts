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
import { validTemplateLanguage } from "../languages";
import { validTheme, validTranslationInput } from "../validations";

export const updateTemplateFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
				template: z.object({
					slug: z.string(),
					defaultTranslation: validTranslationInput,
					translations: z.record(validTemplateLanguage, validTranslationInput),
				}),
				theme: validTheme,
			}),
		),
	)
	.handler(async ({ data }) => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const nonDefaultTranslations = Object.values(
			data.template.translations,
		).filter((t) => t.language !== data.template.defaultTranslation.language);

		await db.transaction(async (tx) => {
			// Apply updates to actual template
			await tx
				.update(templatesTable)
				.set({
					defaultTranslationLanguage: data.template.defaultTranslation.language,
					theme: data.theme,
					modifiedAt: new Date(),
				})
				.where(
					and(
						eq(templatesTable.teamId, data.teamId),
						eq(templatesTable.projectId, data.projectId),
						eq(templatesTable.slug, data.template.slug),
					),
				);

			// Delete all existing translations
			await tx
				.delete(templateTranslationsTable)
				.where(
					and(
						eq(templateTranslationsTable.teamId, data.teamId),
						eq(templateTranslationsTable.projectId, data.projectId),
						eq(templateTranslationsTable.templateSlug, data.template.slug),
					),
				);

			// Insert default translation
			await tx.insert(templateTranslationsTable).values({
				teamId: data.teamId,
				projectId: data.projectId,
				templateSlug: data.template.slug,
				language: data.template.defaultTranslation.language,
				subject: data.template.defaultTranslation.subject,
				contents: data.template.defaultTranslation.contents,
			});

			// Insert non-default translations in parallel
			await Promise.all(
				nonDefaultTranslations.map((t) =>
					tx.insert(templateTranslationsTable).values({
						teamId: data.teamId,
						projectId: data.projectId,
						templateSlug: data.template.slug,
						language: t.language,
						subject: t.subject,
						contents: t.contents,
					}),
				),
			);
		});
	});
