import { db } from "@/modules/database";
import { domainsTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { z } from "zod";
import { getSesV2Client } from "../../clients";

export const deleteProjectDomainFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
				domainId: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const row = await db.query.domainsTable.findFirst({
			where: and(
				eq(domainsTable.teamId, data.teamId),
				eq(domainsTable.projectId, data.projectId),
				eq(domainsTable.id, data.domainId),
			),
		});

		if (!row) {
			throw createError({
				status: 404,
				statusMessage: "Not Found",
			});
		}

		await db.delete(domainsTable).where(eq(domainsTable.id, row.id));

		const sesClient = getSesV2Client();

		await sesClient.deleteEmailIdentity({
			EmailIdentity: row.domain,
		});
	});
