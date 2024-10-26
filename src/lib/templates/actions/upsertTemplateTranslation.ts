"use server";

import { reload } from "@solidjs/router";
import { and, eq } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~/lib/db";
import { templateTranslationsTable, templatesTable } from "~/lib/db/schema";
import { requireUserToBeMemberOfProject } from "~/lib/projects/utils";
import { createFormDataMutation } from "~/lib/server-utils";
import { validTemplateLanguage } from "~/lib/templates/languages";
import { getTemplate } from "~/lib/templates/queries";
import { validTheme } from "../theme";

export const upsertTemplateTranslation = createFormDataMutation({
	schema: v.object({
		projectId: v.string(),
		slug: v.string(),
		language: validTemplateLanguage,
		template: v.object({
			subject: v.string(),
			contents: v.any(),
		}),
		theme: validTheme,
	}),
	async handler({ payload, user }) {
		await requireUserToBeMemberOfProject({
			projectId: payload.projectId,
			userId: user.id,
		});

		await db.transaction(async (db) => {
			await db
				.update(templatesTable)
				.set({
					theme: payload.theme,
				})
				.where(
					and(
						eq(templatesTable.projectId, payload.projectId),
						eq(templatesTable.slug, payload.slug),
					),
				);

			await db
				.insert(templateTranslationsTable)
				.values({
					subject: payload.template.subject,
					contents: payload.template.contents,
					templateSlug: payload.slug,
					language: payload.language,
					projectId: payload.projectId,
				})
				.onConflictDoUpdate({
					target: [
						templateTranslationsTable.projectId,
						templateTranslationsTable.templateSlug,
						templateTranslationsTable.language,
					],
					set: {
						subject: payload.template.subject,
						contents: payload.template.contents,
					},
				});
		});

		return reload({
			revalidate: [
				getTemplate.keyFor({
					projectId: payload.projectId,
					slug: payload.slug,
				}),
			],
		});
	},
});
