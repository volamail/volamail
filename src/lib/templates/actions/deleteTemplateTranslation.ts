"use server";

import { redirect, reload } from "@solidjs/router";
import { and, eq } from "drizzle-orm";
import * as v from "valibot";
import { createError } from "vinxi/http";
import { db } from "~/lib/db";
import { templateTranslationsTable } from "~/lib/db/schema";
import { requireUserToBeMemberOfProject } from "~/lib/projects/utils";
import { createFormDataMutation } from "~/lib/server-utils";
import { validTemplateLanguage } from "../languages";
import { getTemplate } from "../queries";

export const deleteTemplateTranslation = createFormDataMutation({
	schema: v.object({
		projectId: v.string(),
		slug: v.string(),
		language: validTemplateLanguage,
	}),
	async handler({ payload, user }) {
		const { meta } = await requireUserToBeMemberOfProject({
			projectId: payload.projectId,
			userId: user.id,
		});

		if (meta.project.defaultTemplateLanguage === payload.language) {
			throw createError({
				status: 400,
				statusMessage: "can't delete default translation",
			});
		}

		const translation = await db.query.templateTranslationsTable.findFirst({
			where: and(
				eq(templateTranslationsTable.projectId, payload.projectId),
				eq(templateTranslationsTable.templateSlug, payload.slug),
				eq(templateTranslationsTable.language, payload.language),
			),
		});

		if (!translation) {
			throw createError({
				status: 404,
				statusMessage: "Template not found",
			});
		}

		await db
			.delete(templateTranslationsTable)
			.where(
				and(
					eq(templateTranslationsTable.projectId, payload.projectId),
					eq(templateTranslationsTable.templateSlug, payload.slug),
					eq(templateTranslationsTable.language, payload.language),
				),
			);

		return redirect(
			`/t/${meta.project.teamId}/p/${payload.projectId}/emails/${payload.slug}`,
			{
				revalidate: [
					getTemplate.keyFor({
						projectId: payload.projectId,
						slug: payload.slug,
					}),
				],
			},
		);
	},
});
