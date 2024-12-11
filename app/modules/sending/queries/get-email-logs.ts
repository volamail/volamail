import { db } from "@/modules/database";
import { emailsTable } from "@/modules/database/schema";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { subDays } from "date-fns";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";

const PAGE_SIZE = 50;

export const getEmailLogs = createServerFn({ method: "GET" })
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				projectId: z.string(),
				page: z.number().int().min(1).optional().default(1),
			}),
		),
	)
	.handler(async ({ data }) => {
		const [total, rows] = await Promise.all([
			db.query.emailsTable.findFirst({
				where: and(
					eq(emailsTable.teamId, data.teamId),
					eq(emailsTable.projectId, data.projectId),
					gt(emailsTable.sentAt, subDays(new Date(), 30)),
				),
				columns: {},
				extras: {
					count: sql<number>`COUNT(*)`.as("count"),
				},
			}),
			db.query.emailsTable.findMany({
				where: and(
					eq(emailsTable.teamId, data.teamId),
					eq(emailsTable.projectId, data.projectId),
					gt(emailsTable.sentAt, subDays(new Date(), 30)),
				),
				orderBy: desc(emailsTable.sentAt),
				offset: (data.page - 1) * PAGE_SIZE,
				limit: PAGE_SIZE,
			}),
		]);

		return {
			pages: Math.ceil(total!.count / PAGE_SIZE),
			rows,
			total: total!.count,
		};
	});
