import { cache } from "@solidjs/router";
import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";

import { db } from "~/lib/db";
import { templateTranslationsTable, templatesTable } from "~/lib/db/schema";
import type { TemplateLanguage } from "~/lib/templates/languages";
import { requireUser } from "../auth/utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";
import { getModelForTeam } from "./model";
import autocompletePrompt from "./prompts/autocomplete.txt?raw";

export const getProjectTemplates = cache(async (projectId: string) => {
	"use server";

	const user = requireUser();

	await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId,
	});

	return await db.query.templatesTable.findMany({
		where: eq(templatesTable.projectId, projectId),
	});
}, "templates");

export const getTemplate = cache(
	async ({
		projectId,
		slug,
		language,
	}: {
		projectId: string;
		slug: string;
		language?: TemplateLanguage;
	}) => {
		"use server";

		const user = requireUser();

		const { meta } = await requireUserToBeMemberOfProject({
			userId: user.id,
			projectId,
		});

		const translation = await db.query.templateTranslationsTable.findFirst({
			where: and(
				eq(templateTranslationsTable.projectId, projectId),
				eq(templateTranslationsTable.templateSlug, slug),
				eq(
					templateTranslationsTable.language,
					language || meta.project.defaultTemplateLanguage,
				),
			),
			with: {
				template: true,
			},
		});

		if (!translation) {
			throw createError({
				statusCode: 404,
				statusMessage: "Template not found",
			});
		}

		const { template, ...rest } = translation;

		return {
			...template,
			...rest,
		};
	},
	"templates",
);
