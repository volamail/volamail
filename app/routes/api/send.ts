import { db } from "@/modules/database";
import {
	apiTokensTable,
	emailsTable,
	templateTranslationsTable,
	templatesTable,
} from "@/modules/database/schema";
import {
	lowerTeamEmailQuota,
	shouldLowerQuota,
} from "@/modules/payments/quota";
import { sendEmail } from "@/modules/sending";
import {
	type TemplateLanguage,
	validTemplateLanguage,
} from "@/modules/templates/languages";
import {
	renderTemplateToHtml,
	renderTemplateToText,
} from "@/modules/templates/render";
import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { and, eq, isNull } from "drizzle-orm";
import { createError } from "vinxi/http";
import { z } from "zod";

export const APIRoute = createAPIFileRoute("/api/send")({
	async POST({ request }) {
		const body = await request.json();

		const validateResult = await z
			.intersection(
				z.object({
					token: z.string({
						message:
							"A valid API token must be provided as the 'token' parameter",
					}),
					to: z
						.string({ message: "'to' must be a valid email address" })
						.email("'to' must be a valid email address"),
					from: z
						.string({
							message: "'from' must be a valid email address",
						})
						.email("'from' must be a valid email address"),
					data: z.record(z.string(), {
						message:
							"'data' is a required field, and it must be a record of key-value string pairs to replace variables inside the template",
					}),
				}),
				z.union([
					z.object({
						template: z.string({
							message:
								"The field 'template' is required and it should be the ID of a template created in your project",
						}),
						language: validTemplateLanguage.optional(),
					}),
					z.object({
						subject: z.string(),
						html: z.string(),
						text: z.string(),
					}),
				]),
			)
			.safeParseAsync(body);

		if (!validateResult.success) {
			throw createError({
				status: 400,
				statusMessage: "Validation error",
				message: validateResult.error.message,
			});
		}

		const params = validateResult.data;

		const token = await db.query.apiTokensTable.findFirst({
			where: and(
				eq(apiTokensTable.token, params.token),
				isNull(apiTokensTable.revokedAt),
			),
			with: {
				project: {
					with: {
						domains: true,
						team: {
							with: {
								subscription: true,
							},
						},
					},
				},
			},
		});

		if (!token) {
			throw createError({
				status: 403,
				statusMessage: "Forbidden",
				message: "The provided token is invalid",
			});
		}

		const project = token.project;
		const team = project.team;
		const subscription = team.subscription;

		if (!subscription || subscription.remainingQuota <= 0) {
			throw createError({
				status: 429,
				statusMessage: "Quota reached",
				message: "The team's email quota has been reached",
			});
		}

		const domain = getDomainFromAddress(params.from);

		if (!project.domains.some((d) => d.domain === domain && d.verified)) {
			throw createError({
				status: 403,
				statusMessage: "Forbidden",
				message: "The 'from' address domain is not verified",
			});
		}

		let html: string;
		let text: string;
		let subject: string;

		let language: TemplateLanguage | null = null;

		if ("html" in params) {
			html = params.html;
			text = params.text;
			subject = params.subject;
		} else {
			const template = await db.query.templatesTable.findFirst({
				where: and(
					eq(templatesTable.teamId, team.id),
					eq(templatesTable.projectId, project.id),
					eq(templatesTable.slug, params.template),
				),
			});

			if (!template) {
				throw createError({
					status: 404,
					statusMessage: "Not found",
					message: "Template not found",
				});
			}

			let translation = await db.query.templateTranslationsTable.findFirst({
				where: and(
					eq(templateTranslationsTable.teamId, team.id),
					eq(templateTranslationsTable.projectId, project.id),
					eq(templateTranslationsTable.templateSlug, params.template),
					eq(
						templateTranslationsTable.language,
						params.language || template.defaultTranslationLanguage,
					),
				),
			});

			if (!translation) {
				translation = await db.query.templateTranslationsTable.findFirst({
					where: and(
						eq(templateTranslationsTable.teamId, team.id),
						eq(templateTranslationsTable.projectId, project.id),
						eq(templateTranslationsTable.templateSlug, params.template),
						eq(
							templateTranslationsTable.language,
							template.defaultTranslationLanguage,
						),
					),
				});

				if (!translation) {
					throw createError({
						status: 404,
						statusMessage: "Template translation not found",
					});
				}
			}

			language = translation.language;

			html = renderTemplateToHtml({
				contents: translation.contents,
				theme: template.theme,
			});

			text = renderTemplateToText({
				contents: translation.contents,
				theme: template.theme,
			});

			subject = translation.subject;
		}

		const email = await sendEmail({
			from: {
				address: params.from,
				label: project.name,
			},
			to: params.to,
			subject,
			html,
			text,
		});

		await db.insert(emailsTable).values({
			from: params.from,
			to: params.to,
			subject,
			id: email.MessageId!,
			teamId: team.id,
			projectId: project.id,
			status: "SENT",
			language,
			sentAt: new Date(),
			updatedAt: new Date(),
		});

		if (shouldLowerQuota()) {
			await lowerTeamEmailQuota(token.project.teamId);
		}

		return json({
			success: true,
		});
	},
});

function getDomainFromAddress(email: string) {
	return email.split("@")[1];
}
