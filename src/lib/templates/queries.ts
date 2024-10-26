import { cache } from "@solidjs/router";
import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";

import { db } from "~/lib/db";
import { templatesTable } from "~/lib/db/schema";
import { requireUser } from "../auth/utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";

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
	}: {
		projectId: string;
		slug: string;
	}) => {
		"use server";

		const user = requireUser();

		await requireUserToBeMemberOfProject({
			userId: user.id,
			projectId,
		});

		const template = await db.query.templatesTable.findFirst({
			where: and(
				eq(templatesTable.projectId, projectId),
				eq(templatesTable.slug, slug),
			),
			with: {
				translations: {
					columns: {
						language: true,
						contents: true,
						subject: true,
					},
				},
			},
		});

		if (!template) {
			throw createError({
				statusCode: 404,
				statusMessage: "Template not found",
			});
		}

		return template;
	},
	"templates",
);
