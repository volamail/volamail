import { db } from "@/modules/database";
import {
	templateTranslationsTable,
	templatesTable,
} from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import slugify from "slugify";
import { z } from "zod";
import { validTemplateLanguage } from "../languages";
import { validTheme, validTranslationInput } from "../validations";

export const createTemplateFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
				template: z.object({
					slug: z
						.string()
						.refine(
							(value) =>
								slugify(value, { lower: true, strict: true }) === value,
						),
					defaultTranslation: validTranslationInput,
					translations: z.record(validTemplateLanguage, validTranslationInput),
					theme: validTheme,
				}),
			}),
		),
	)
	.handler(async ({ data }) => {
		const nonDefaultTranslations = Object.values(
			data.template.translations,
		).filter((t) => t.language !== data.template.defaultTranslation.language);

		await db.transaction(async (tx) => {
			await tx.insert(templatesTable).values({
				teamId: data.teamId,
				projectId: data.projectId,
				slug: data.template.slug,
				defaultTranslationLanguage: data.template.defaultTranslation.language,
				theme: data.template.theme,
			});

			await tx.insert(templateTranslationsTable).values({
				teamId: data.teamId,
				projectId: data.projectId,
				templateSlug: data.template.slug,
				language: data.template.defaultTranslation.language,
				subject: data.template.defaultTranslation.subject,
				contents: data.template.defaultTranslation.contents,
			});

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
