import { db } from "@/modules/database";
import { domainsTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { validateIdentityVerification } from "..";

export const getProjectDomainsFn = createServerFn({ method: "GET" })
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
		const domains = await db.query.domainsTable.findMany({
			where: eq(domainsTable.projectId, data.projectId),
			orderBy: desc(domainsTable.createdAt),
		});

		return await Promise.all(
			domains.map(async (row) => {
				const verified = await validateIdentityVerification(row);

				return {
					...row,
					verified,
					createdAt: row.createdAt.toISOString(),
				};
			}),
		);
	});
