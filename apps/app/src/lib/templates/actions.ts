import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createError } from "vinxi/http";
import { generateObject, generateText } from "ai";
import { action, redirect } from "@solidjs/router";
import { object, string, optional, pipe, maxLength } from "valibot";

import { db } from "~/lib/db";
import { getModelForTeam } from "./model";
import * as schema from "~/lib/db/schema";
import { requireUser } from "~/lib/auth/utils";
import { parseFormData } from "../server-utils";
import editPrompt from "./prompts/edit.txt?raw";
import { captureAiRequestEvent } from "../analytics";
import generatePrompt from "./prompts/generate.txt?raw";
import inlineEditPrompt from "./prompts/inline-edit.txt?raw";
import { requireUserToBeMemberOfProject } from "~/lib/projects/utils";

export const createTemplate = action(async (formData: FormData) => {
	"use server";

	const result = await parseFormData(
		object({
			projectId: string(),
			body: string(),
			slug: string(),
			subject: string(),
		}),
		formData,
	);

	const user = requireUser();

	const { meta } = await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: result.projectId,
	});

	const existing = await db.query.templatesTable.findFirst({
		where: and(
			eq(schema.templatesTable.slug, result.slug),
			eq(schema.templatesTable.projectId, result.projectId),
		),
		columns: {
			id: true,
		},
	});

	if (existing) {
		throw new Error("Template slug already in use");
	}

	await db.insert(schema.templatesTable).values(result);

	throw redirect(
		`/t/${meta.project.team?.id || 0}/p/${result.projectId}/emails`,
	);
}, "templates");

export const editTemplate = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	const result = await parseFormData(
		object({
			id: string(),
			slug: string(),
			subject: string(),
			body: string(),
		}),
		formData,
	);

	const template = await db.query.templatesTable.findFirst({
		where: eq(schema.templatesTable.id, result.id),
	});

	if (!template) {
		throw createError({
			statusCode: 404,
			statusMessage: "Template not found",
		});
	}

	await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: template.projectId,
	});

	// TODO: Check if slug is already in use

	await db
		.update(schema.templatesTable)
		.set(result)
		.where(eq(schema.templatesTable.id, result.id));

	return {
		success: true,
	};
}, "templates");

export const generateTemplate = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	const payload = await parseFormData(
		object({
			prompt: string(),
			image: optional(string()),
			projectId: string(),
			context: optional(pipe(string(), maxLength(200))),
		}),
		formData,
	);

	const { meta } = await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: payload.projectId,
	});

	const result = await generateObject({
		model: await getModelForTeam({
			teamId: meta.project.team.id,
			tier: "large",
		}),
		system: `${generatePrompt}\n${getProjectSystemMessage({
			name: meta.project.name,
			context: payload.context,
		})}`,
		prompt: `Prompt: ${
			payload.image ? `Using the image with URL ${payload.image}, ` : ""
		}${payload.prompt}`,
		schema: z.object({
			slug: z.string(),
			subject: z.string(),
			html: z.string(),
		}),
	}).catch((e) => {
		console.log(e);

		throw createError({
			statusCode: 500,
			statusMessage: "Internal server error",
		});
	});

	await captureAiRequestEvent(user.id);

	return result.object;
});

export const editHtmlTemplate = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	const payload = await parseFormData(
		object({
			prompt: string(),
			html: string(),
			projectId: string(),
			image: optional(string()),
			context: optional(pipe(string(), maxLength(200))),
		}),
		formData,
	);

	const { meta } = await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: payload.projectId,
	});

	const result = await generateText({
		model: await getModelForTeam({
			teamId: meta.project.team.id,
			tier: "large",
		}),
		system: `${editPrompt}\n${getProjectSystemMessage({
			name: meta.project.name,
			context: payload.context,
		})}`,
		prompt: `HTML: ${payload.html}\nPrompt: ${
			payload.image ? `Using the image with URL ${payload.image}, ` : ""
		}${payload.prompt}`,
	});

	await captureAiRequestEvent(user.id);

	return result.text;
});

export const editTemplateElement = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	const payload = await parseFormData(
		object({
			element: string(),
			prompt: string(),
			projectId: string(),
		}),
		formData,
	);

	const { meta } = await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: payload.projectId,
	});

	const result = await generateText({
		model: await getModelForTeam({
			teamId: meta.project.team.id,
			tier: "small",
		}),
		system: inlineEditPrompt,
		prompt: `HTML:${payload.element}\nPrompt:${payload.prompt}`,
	});

	await captureAiRequestEvent(user.id);

	return {
		code: result.text,
	};
});

export const deleteTemplate = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	const payload = await parseFormData(
		object({
			projectId: string(),
			id: string(),
		}),
		formData,
	);

	const { meta } = await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: payload.projectId,
	});

	await db
		.delete(schema.templatesTable)
		.where(
			and(
				eq(schema.templatesTable.id, payload.id),
				eq(schema.templatesTable.projectId, payload.projectId),
			),
		);

	throw redirect(`/t/${meta.project.team.id}/p/${payload.projectId}/emails`);
}, "templates");

export const getTemplateInForm = action(async (formData: FormData) => {
	"use server";

	requireUser();

	const body = await parseFormData(
		object({
			id: string(),
		}),
		formData,
	);

	const row = await db.query.templatesTable.findFirst({
		where: eq(schema.templatesTable.id, body.id),
	});

	if (!row) {
		throw createError({
			statusCode: 404,
			statusMessage: "Template not found",
		});
	}

	return {
		subject: row.subject,
		body: row.body,
		slug: row.slug,
	};
}, "templates");

function getProjectSystemMessage(project: {
	name: string;
	context?: string | null;
}) {
	return `Project name: ${project.name}${
		project.context ? `\nProject description: ${project.context}` : ""
	}`;
}
