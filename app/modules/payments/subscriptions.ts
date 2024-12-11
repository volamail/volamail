import { addDays } from "date-fns";
import { ulid } from "ulid";
import type { TransactionClient, db } from "../database";
import { subscriptionsTable } from "../database/schema";

export async function createFreeTierSubscription(
	teamId: string,
	tx: TransactionClient,
) {
	const id = ulid();

	await tx.insert(subscriptionsTable).values({
		id,
		teamId,
		tier: "FREE",
		remainingQuota: 500,
		monthlyQuota: 500,
		periodType: "MONTHLY",
		lastRefilledAt: new Date(),
		storageQuota: 20000,
		price: "0.00",
		renewsAt: addDays(new Date(), 30),
		status: "ACTIVE",
		maxDomains: 1,
	});

	return id;
}
