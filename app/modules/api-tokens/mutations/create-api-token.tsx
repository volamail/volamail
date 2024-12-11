import { db } from "@/modules/database";
import { apiTokensTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { ulid } from "ulid";
import { z } from "zod";

export const createApiTokenFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
				description: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const token = `vl_${ulid()}`;

		await db.insert(apiTokensTable).values({
			teamId: data.teamId,
			projectId: data.projectId,
			description: data.description,
			token,
			createdAt: new Date(),
		});

		return token;
	});
