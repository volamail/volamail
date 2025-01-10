import { and, eq, gte, sql } from "drizzle-orm";
import { clientEnv } from "../client-env";
import { db } from "../database";
import { emailsTable } from "../database/schema";

export function shouldLowerQuota(teamId?: string) {
	return clientEnv.VITE_SELF_HOSTED === "false";
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
