import { eq, sql } from "drizzle-orm";
import { action } from "@solidjs/router";
import { createError } from "vinxi/http";
import { object, optional, pipe, record, string, transform } from "valibot";

import { db } from "../db";
import { sendMail } from "./send";
import { env } from "../environment/env";
import { requireUser } from "../auth/utils";
import { parseFormData } from "../server-utils";
import { isSelfHosted } from "../environment/utils";
import { emailsTable, subscriptionsTable } from "../db/schema";
import { requireUserToBeMemberOfProject } from "../projects/utils";
import { renderTemplateToHtml } from "~/lib/templates/render";
import type { JSONContent } from "@tiptap/core";

export const sendTestMail = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: "Unauthorized",
		});
	}

	const payload = await parseFormData(
		object({
			projectId: string(),
			subject: string(),
			contents: pipe(
				string(),
				transform((contents) => JSON.parse(contents) as JSONContent),
			),
			data: optional(record(string(), string())),
		}),
		formData,
	);

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
		const body = await renderTemplateToHtml(payload.contents);

		const message = await sendMail({
			from: `Volamail <${env.NOREPLY_EMAIL}>`,
			to: user.email,
			body,
			subject: payload.subject,
			data: payload.data || {},
		});

		if (!message.MessageId) {
			throw createError({
				statusCode: 500,
				statusMessage: "Internal server error: missing message creation",
			});
		}

		messageId = message.MessageId;
	} catch (e) {
		console.log(e);
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
		subject: payload.subject,
		sentAt: new Date(),
		updatedAt: new Date(),
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
});
