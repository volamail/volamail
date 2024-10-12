import * as v from "valibot";
import { createError } from "vinxi/http";
import { and, eq, sql } from "drizzle-orm";
import type { APIEvent } from "@solidjs/start/server";

import { db } from "~/lib/db";
import { lucia } from "~/lib/auth/lucia";
import * as schema from "~/lib/db/schema";
import { sendMail } from "~/lib/mail/send";
import * as analytics from "~/lib/analytics";
import { isSelfHosted } from "~/lib/environment/utils";
import { validTemplateLanguage } from "~/lib/templates/languages";
import {
	renderTemplateToHtml,
	renderTemplateToText,
} from "~/lib/templates/render";

export async function POST({ request }: APIEvent) {
	// TODO: Rate-limit

	const authHeader = request.headers.get("Authorization");

	const token = lucia.readBearerToken(authHeader || "");

	if (!token) {
		throw createError({
			status: 401,
			statusMessage: "Unauthorized",
		});
	}

	const body = await request.json();

	const payload = await v.parseAsync(
		v.object({
			template: v.string(
				'invalid "template" value. it should be a string with the id of the email template',
			),
			data: v.optional(
				v.record(
					v.string(),
					v.string(),
					'"data" must be a record of string:string pairs',
				),
			),
			from: v.pipe(
				v.string('"from" email address is required'),
				v.email('"from" is not a valid email address'),
			),
			to: v.pipe(
				v.string('"to" email address is required'),
				v.email('"to" is not a valid email address'),
			),
			language: v.optional(validTemplateLanguage),
			options: v.optional(
				v.object({
					fallbackToDefaultLanguage: v.optional(v.boolean()),
				}),
			),
		}),
		body,
	);

	const tokenRow = await db.query.apiTokensTable.findFirst({
		where: eq(schema.apiTokensTable.token, token),
		with: {
			project: {
				with: {
					team: {
						with: {
							subscription: true,
						},
					},
				},
			},
		},
	});

	if (!tokenRow) {
		throw createError({
			status: 401,
			statusMessage: "Unauthorized",
		});
	}

	const team = tokenRow.project.team;
	const project = tokenRow.project;

	if (team.subscription.remainingQuota <= 0 && !isSelfHosted()) {
		throw createError({
			status: 429,
			statusMessage: "Quota reached",
		});
	}

	const fromDomain = payload.from.split("@")[1];

	const domain = await db.query.domainsTable.findFirst({
		where: and(
			eq(schema.domainsTable.projectId, project.id),
			eq(schema.domainsTable.domain, fromDomain),
			eq(schema.domainsTable.verified, true),
		),
		columns: {
			id: true,
		},
	});

	if (!domain) {
		throw createError({
			status: 400,
			statusMessage: "From domain not found",
		});
	}

	let translation = await db.query.templateTranslationsTable.findFirst({
		where: and(
			eq(schema.templateTranslationsTable.projectId, project.id),
			eq(schema.templateTranslationsTable.templateSlug, payload.template),
			eq(
				schema.templateTranslationsTable.language,
				payload.language || project.defaultTemplateLanguage,
			),
		),
	});

	if (!translation) {
		if (payload.options?.fallbackToDefaultLanguage) {
			translation = await db.query.templateTranslationsTable.findFirst({
				where: and(
					eq(schema.templateTranslationsTable.projectId, project.id),
					eq(schema.templateTranslationsTable.templateSlug, payload.template),
					eq(
						schema.templateTranslationsTable.language,
						project.defaultTemplateLanguage,
					),
				),
			});
		}
	} else {
		if (
			!payload.options?.fallbackToDefaultLanguage &&
			payload.language !== translation.language
		) {
			// If the user didn't ask for the default language,
			// but we only found a translation falling back
			// to the default language, we will not send the email.
			translation = undefined;
		}
	}

	if (!translation) {
		throw createError({
			status: 404,
			statusMessage: "Template or translation not found",
		});
	}

	let messageId: string;

	try {
		const [html, text] = await Promise.all([
			renderTemplateToHtml(translation.contents),
			renderTemplateToText(translation.contents),
		]);

		const email = await sendMail({
			from: `${project.name} <${payload.from}>`,
			to: payload.to,
			subject: translation.subject,
			body: html,
			text,
			data: payload.data,
		});

		if (!email.MessageId) {
			throw new Error("No message ID returned");
		}

		messageId = email.MessageId;
	} catch {
		throw createError({
			statusCode: 500,
			statusMessage: "Internal server error",
		});
	}

	await db.insert(schema.emailsTable).values({
		id: messageId,
		projectId: project.id,
		to: payload.to,
		status: "SENT",
		from: payload.from,
		subject: translation.subject,
		sentAt: new Date(),
		updatedAt: new Date(),
		language: translation.language,
	});

	await analytics.captureEmailSentEvent(project.teamId);

	// TODO: wrap this (and above) in a transaction
	if (!isSelfHosted()) {
		await db
			.update(schema.subscriptionsTable)
			.set({
				remainingQuota: sql`${schema.subscriptionsTable.remainingQuota} - 1`,
			})
			.where(eq(schema.subscriptionsTable.id, team.subscription.id));
	}

	return {
		success: true,
	};
}
