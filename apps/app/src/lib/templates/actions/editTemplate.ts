import { action, reload } from "@solidjs/router";
import { and, eq } from "drizzle-orm";
import * as v from "valibot";
import { requireUser } from "~/lib/auth/utils";
import { db } from "~/lib/db";
import { templatesTable, templateTranslationsTable } from "~/lib/db/schema";
import { requireUserToBeMemberOfProject } from "~/lib/projects/utils";
import { parseFormData } from "~/lib/server-utils";
import { validTemplateLanguage } from "~/lib/templates/languages";
import { getTemplate } from "~/lib/templates/queries";

const schema = v.object({
	projectId: v.string(),
	templateSlug: v.string(),
	language: v.optional(validTemplateLanguage),
	subject: v.string(),
	contents: v.any(),
	slug: v.string(),
});

export const editTemplate = action(async (formData: FormData) => {
	"use server";

	const payload = await parseFormData(schema, formData);

	const user = requireUser();

	const { meta } = await requireUserToBeMemberOfProject({
		projectId: payload.projectId,
		userId: user.id,
	});

	await db.transaction(async (db) => {
		if (payload.templateSlug !== payload.slug) {
			await db
				.update(templatesTable)
				.set({
					slug: payload.slug,
				})
				.where(
					and(
						eq(templatesTable.slug, payload.templateSlug),
						eq(templatesTable.projectId, payload.projectId),
					),
				);
		}

		await db
			.update(templateTranslationsTable)
			.set({
				subject: payload.subject,
				contents: payload.contents,
				language: payload.language,
				templateSlug: payload.slug,
			})
			.where(
				and(
					eq(templateTranslationsTable.projectId, payload.projectId),
					eq(templateTranslationsTable.templateSlug, payload.templateSlug),
					eq(
						templateTranslationsTable.language,
						payload.language || meta.project.defaultTemplateLanguage,
					),
				),
			);
	});

	return reload({
		revalidate: [
			getTemplate.keyFor({
				projectId: payload.projectId,
				slug: payload.slug,
				language: payload.language,
			}),
		],
	});
});
