import { db } from "@/modules/database";
import { domainsTable, teamsTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { z } from "zod";
import { addDomainToProject } from "..";

export const addProjectDomainFn = createServerFn({ method: "POST" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
				domain: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const projectDomains = await db.query.domainsTable.findMany({
			where: and(
				eq(domainsTable.teamId, data.teamId),
				eq(domainsTable.projectId, data.projectId),
			),
		});

		const team = await db.query.teamsTable.findFirst({
			where: eq(teamsTable.id, data.teamId),
			with: {
				subscription: true,
			},
		});

		if (!team) {
			throw createError({
				status: 404,
				message: "Team not found",
			});
		}

		if (projectDomains.length >= team.subscription!.maxDomains) {
			throw createError({
				status: 429,
				message: "Max number of domains reached",
			});
		}

		if (
			await db.query.domainsTable.findFirst({
				where: eq(domainsTable.domain, data.domain),
			})
		) {
			throw createError({
				status: 400,
				message: "Domain already used",
			});
		}

		return await addDomainToProject(data, data.domain);
	});
