import { action, redirect } from "@solidjs/router";
import * as v from "valibot";
import { requireUser } from "~/lib/auth/utils";
import { db } from "~/lib/db";
import { templatesTable, templateTranslationsTable } from "~/lib/db/schema";
import { requireUserToBeMemberOfProject } from "~/lib/projects/utils";
import { parseFormData } from "~/lib/server-utils";
import { getProjectTemplates } from "~/lib/templates/queries";

const schema = v.object({
	projectId: v.string(),
	slug: v.string(),
	subject: v.string(),
	contents: v.any(),
});

export const createTemplate = action(async (input: FormData) => {
	"use server";

	const { projectId, ...template } = await parseFormData(schema, input);

	const user = requireUser();

	const { meta } = await requireUserToBeMemberOfProject({
		projectId,
		userId: user.id,
	});

	await db.transaction(async (db) => {
		await db.insert(templatesTable).values({
			slug: template.slug,
			projectId,
			createdAt: new Date(),
		});

		await db.insert(templateTranslationsTable).values({
			projectId,
			templateSlug: template.slug,
			language: meta.project.defaultTemplateLanguage,
			subject: template.subject,
			contents: template.contents,
		});
	});

	return redirect(`/t/${meta.project.teamId}/p/${projectId}/emails`, {
		revalidate: [getProjectTemplates.keyFor(projectId)],
	});
}, "createTemplate");
