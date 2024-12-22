import { db } from "@/modules/database";
import { emailsTable } from "@/modules/database/schema";
import { env } from "@/modules/env";
import {
	getTeamRemainingEmailQuota,
	shouldLowerQuota,
} from "@/modules/payments/quota";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { sendEmail } from "@/modules/sending";
import { createServerFn } from "@tanstack/start";
import { createError } from "vinxi/http";
import { z } from "zod";
import { renderTemplateToHtml, renderTemplateToText } from "../render";
import { validTheme } from "../validations";

export const sendTemplateTestFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
				template: z.object({
					subject: z.string(),
					contents: z.any(),
				}),
				theme: validTheme,
			}),
		),
	)
	.handler(async ({ data, context }) => {
		const { template, theme } = data;
		const { user } = context;

		const html = renderTemplateToHtml({
			contents: template.contents,
			theme,
		});

		const text = renderTemplateToText({
			contents: template.contents,
			theme,
		});

		if (shouldLowerQuota()) {
			const remainingQuota = await getTeamRemainingEmailQuota(data.teamId);

			if (remainingQuota <= 0) {
				throw createError({
					status: 429,
					statusMessage: "Quota reached",
					message: "The team's email quota has been reached",
				});
			}
		}

		const email = await sendEmail({
			from: {
				address: env.VITE_NOREPLY_EMAIL,
				label: "Volamail",
			},
			to: user.email,
			subject: template.subject,
			html,
			text,
		});

		await db.insert(emailsTable).values({
			from: env.VITE_NOREPLY_EMAIL,
			to: user.email,
			subject: template.subject,
			id: email.MessageId!,
			teamId: data.teamId,
			projectId: data.projectId,
			status: "SENT",
			language: null,
			sentAt: new Date(),
			updatedAt: new Date(),
		});
	});
