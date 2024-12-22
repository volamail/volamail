import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../database";
import { emailsTable } from "../database/schema";
import { env } from "../env";

export function shouldLowerQuota(teamId?: string) {
	return env.VITE_SELF_HOSTED === "false";
}

export async function getTeamRemainingEmailQuota(teamId: string) {
	const subscription = await db.query.subscriptionsTable.findFirst({
		where: (table, { eq }) => eq(table.teamId, teamId),
	});

	if (!subscription) {
		throw new Error("Subscription not found");
	}

	const [{ count: emailCount }] = await db
		.select({
			count: sql<number>`count(*)`,
		})
		.from(emailsTable)
		.where(
			and(
				eq(emailsTable.teamId, teamId),
				gte(emailsTable.sentAt, subscription.lastRefilledAt),
			),
		);

	if (emailCount >= subscription.monthlyEmailQuota) {
		return 0;
	}

	return subscription.monthlyEmailQuota - emailCount;
}
