import { db } from "@/modules/database";
import {
	domainsTable,
	emailsTable,
	projectsTable,
} from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { z } from "zod";

export const getTeamUsageFn = createServerFn({ method: "GET" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const subscription = await db.query.subscriptionsTable.findFirst({
			where: (table, { eq }) => eq(table.teamId, data.teamId),
		});

		if (!subscription) {
			throw createError({
				status: 404,
				statusMessage: "subscription not found",
			});
		}

		const [emails, domains, projects] = await Promise.all([
			db.$count(emailsTable, eq(emailsTable.teamId, data.teamId)),
			db.$count(domainsTable, eq(domainsTable.teamId, data.teamId)),
			db.$count(projectsTable, eq(projectsTable.teamId, data.teamId)),
		]);

		return {
			emails: {
				max: subscription.monthlyEmailQuota,
				used: emails,
				lastRefilledAt: subscription.lastRefilledAt,
				refillsAt: subscription.refillsAt,
			},
			domains: {
				max: subscription.maxDomains,
				used: domains,
			},
			projects: {
				max: subscription.maxProjects,
				used: projects,
			},
		};
	});
