"use server";

import { redirect } from "@solidjs/router";
import * as v from "valibot";
import { db } from "~/lib/db";
import { templateTranslationsTable, templatesTable } from "~/lib/db/schema";
import { requireUserToBeMemberOfProject } from "~/lib/projects/utils";
import { createFormDataMutation } from "~/lib/server-utils";
import { getProjectTemplates } from "~/lib/templates/queries";
import { validTheme } from "../theme";

export const createTemplate = createFormDataMutation({
	schema: v.object({
		projectId: v.string(),
		template: v.object({
			slug: v.string(),
			subject: v.string(),
			contents: v.any(),
		}),
		theme: validTheme,
	}),
	async handler({ payload, user }) {
		const { meta } = await requireUserToBeMemberOfProject({
			projectId: payload.projectId,
			userId: user.id,
		});

		await db.transaction(async (db) => {
			await db.insert(templatesTable).values({
				slug: payload.template.slug,
				projectId: payload.projectId,
				theme: payload.theme,
				createdAt: new Date(),
			});

			await db.insert(templateTranslationsTable).values({
				projectId: payload.projectId,
				templateSlug: payload.template.slug,
				language: meta.project.defaultTemplateLanguage,
				subject: payload.template.subject,
				contents: payload.template.contents,
			});
		});

		return redirect(`/t/${meta.project.teamId}/p/${payload.projectId}/emails`, {
			revalidate: [getProjectTemplates.keyFor(payload.projectId)],
		});
	},
});
