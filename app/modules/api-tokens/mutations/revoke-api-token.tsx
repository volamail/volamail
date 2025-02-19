import { db } from "@/modules/database";
import { apiTokensTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const revokeApiTokenFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
				tokenId: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		await db
			.update(apiTokensTable)
			.set({
				revokedAt: new Date(),
			})
			.where(
				and(
					eq(apiTokensTable.teamId, data.teamId),
					eq(apiTokensTable.projectId, data.projectId),
					eq(apiTokensTable.id, data.tokenId),
				),
			);
	});
