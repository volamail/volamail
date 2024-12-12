import { eq, sql } from "drizzle-orm";
import { db } from "../database";
import { subscriptionsTable, teamsTable } from "../database/schema";
import { serverEnv } from "../environment/server";

export function shouldLowerQuota(teamId?: string) {
	return serverEnv.VITE_SELF_HOSTED === "false";
}

export async function lowerTeamEmailQuota(teamId: string, amount = 1) {
	const [subscriptionRow] = await db
		.select({ subscription: subscriptionsTable })
		.from(subscriptionsTable)
		.leftJoin(teamsTable, eq(subscriptionsTable.teamId, teamsTable.id))
		.where(eq(teamsTable.id, teamId))
		.limit(1);

	if (!subscriptionRow) {
		throw new Error(`Couldn't find subscription for team ${teamId}`);
	}

	const { subscription } = subscriptionRow;

	if (subscription.remainingQuota < amount) {
		throw new Error(`Team ${teamId} has insufficient quota`);
	}

	await db
		.update(subscriptionsTable)
		.set({
			remainingQuota: sql`${subscriptionsTable.remainingQuota} - 1`,
		})
		.where(eq(subscriptionsTable.id, subscription.id));
}
