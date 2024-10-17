import slugify from "slugify";
import { DateTime } from "luxon";
import { customAlphabet } from "nanoid";

import { db } from "~/lib/db";
import * as schema from "~/lib/db/schema";
import * as subscriptions from "~/lib/subscriptions/constants";

export async function createTeam(
	name: string,
	database:
		| typeof db
		| Parameters<Parameters<typeof db.transaction>[0]>[0] = db,
) {
	let id = slugify(name, { lower: true, strict: true });

	const existingTeam = await database.query.teamsTable.findFirst({
		where: (_, { eq }) => eq(schema.teamsTable.id, id),
		columns: {
			id: true,
		},
	});

	if (existingTeam) {
		const nanoid = customAlphabet("0123456789", 6);

		id = `${id}-${nanoid()}`;
	}

	const defaultProjectId = await database.transaction(async (db) => {
		const [{ insertedId: subscriptionId }] = await db
			.insert(schema.subscriptionsTable)
			.values({
				tier: subscriptions.SUBSCRIPTION_TYPE_FREE,
				remainingQuota:
					subscriptions.SUBSCRIPTION_QUOTAS[
						subscriptions.SUBSCRIPTION_TYPE_FREE
					].emails,
				monthlyQuota:
					subscriptions.SUBSCRIPTION_QUOTAS[
						subscriptions.SUBSCRIPTION_TYPE_FREE
					].emails,
				periodType: "MONTHLY",
				lastRefilledAt: DateTime.now().toJSDate(),
				storageQuota:
					subscriptions.SUBSCRIPTION_QUOTAS[
						subscriptions.SUBSCRIPTION_TYPE_FREE
					].storage,
				price: "0.00",
				renewsAt: DateTime.now().plus({ days: 30 }).toJSDate(),
				status: "ACTIVE",
			})
			.returning({ insertedId: schema.subscriptionsTable.id });

		await database.insert(schema.teamsTable).values({
			id,
			name,
			subscriptionId,
		});

		const [{ insertedId: projectId }] = await db
			.insert(schema.projectsTable)
			.values({
				teamId: id,
				name: "Untitled project",
			})
			.returning({ insertedId: schema.projectsTable.id });

		return projectId;
	});

	return {
		teamId: id,
		projectId: defaultProjectId,
	};
}
