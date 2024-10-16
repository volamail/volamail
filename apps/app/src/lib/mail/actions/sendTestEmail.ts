"use server";

import type { JSONContent } from "@tiptap/core";
import { eq, sql } from "drizzle-orm";
import * as v from "valibot";
import { createError } from "vinxi/http";
import { db } from "~/lib/db";
import { emailsTable, subscriptionsTable } from "~/lib/db/schema";
import { env } from "~/lib/environment/env";
import { isSelfHosted } from "~/lib/environment/utils";
import { requireUserToBeMemberOfProject } from "~/lib/projects/utils";
import { createFormDataMutation } from "~/lib/server-utils";
import { validTemplateLanguage } from "~/lib/templates/languages";
import {
	renderTemplateToHtml,
	renderTemplateToText,
} from "~/lib/templates/render";
import { validTheme } from "~/lib/templates/theme";
import { sendMail } from "../send";

export const sendTestMail = createFormDataMutation({
	schema: v.object({
		projectId: v.string(),
		template: v.object({
			subject: v.string(),
			contents: v.pipe(
				v.string(),
				v.transform((contents) => JSON.parse(contents) as JSONContent),
			),
			data: v.optional(v.record(v.string(), v.string())),
			language: v.optional(validTemplateLanguage),
		}),
		theme: validTheme,
	}),
	handler: async ({ payload, user }) => {
		const { meta } = await requireUserToBeMemberOfProject({
			userId: user.id,
			projectId: payload.projectId,
		});

		const subcription = await db.query.subscriptionsTable.findFirst({
			where: eq(subscriptionsTable.id, meta.project.team.subscriptionId),
		});

		if (!subcription) {
			throw createError({
				statusCode: 404,
				statusMessage: "No subscription",
			});
		}

		if (subcription.remainingQuota <= 0 && !isSelfHosted()) {
			throw createError({
				statusCode: 429,
				statusMessage: "Quota reached",
			});
		}

		let messageId: string;

		try {
			const [body, text] = await Promise.all([
				renderTemplateToHtml(payload.template.contents, payload.theme),
				renderTemplateToText(payload.template.contents, payload.theme),
			]);

			const message = await sendMail({
				from: `Volamail <${env.NOREPLY_EMAIL}>`,
				to: user.email,
				body,
				subject: payload.template.subject,
				data: payload.template.data || {},
				text,
			});

			if (!message.MessageId) {
				throw createError({
					statusCode: 500,
					statusMessage: "Internal server error: missing message creation",
				});
			}

			messageId = message.MessageId;
		} catch (e) {
			throw createError({
				statusCode: 500,
				statusMessage: "Internal server error",
			});
		}

		await db.insert(emailsTable).values({
			id: messageId,
			status: "SENT",
			projectId: payload.projectId,
			to: user.email,
			from: env.NOREPLY_EMAIL,
			subject: payload.template.subject,
			sentAt: new Date(),
			updatedAt: new Date(),
			language:
				payload.template.language || meta.project.defaultTemplateLanguage,
		});

		// TODO: wrap this (and above) in a transaction
		if (!isSelfHosted()) {
			await db
				.update(subscriptionsTable)
				.set({
					remainingQuota: sql`${subscriptionsTable.remainingQuota} - 1`,
				})
				.where(eq(subscriptionsTable.id, subcription.id));
		}

		return {
			success: true,
		};
	},
});
