import { db } from "@/modules/database";
import { apiTokensTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export const getProjectApiTokensFn = createServerFn({ method: "GET" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const rows = await db.query.apiTokensTable.findMany({
			where: and(
				eq(apiTokensTable.teamId, data.teamId),
				eq(apiTokensTable.projectId, data.projectId),
			),
			orderBy: [desc(apiTokensTable.revokedAt), desc(apiTokensTable.createdAt)],
		});

		return rows.map((row) => ({
			...row,
			token: `vl_************${row.token.slice(-4)}`,
			createdAt: row.createdAt.toISOString(),
			revokedAt: row.revokedAt?.toISOString() || null,
		}));
	});
