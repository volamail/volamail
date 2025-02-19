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
		monthlyEmailQuota: 500,
		periodType: "MONTHLY",
		refillsAt: addDays(new Date(), 30),
		lastRefilledAt: new Date(),
		price: "0.00",
		renewsAt: addDays(new Date(), 30),
		status: "ACTIVE",
		maxDomains: 2,
		maxProjects: 2,
	});

	return id;
}
