import { eq, sum } from "drizzle-orm";
import { createError } from "vinxi/http";

import { db } from "../db";
import { imagesTable, teamsTable } from "../db/schema";

export async function requireProjectStorageLeft({
	projectId,
	kilobytes,
	teamId,
}: {
	projectId: string;
	kilobytes: number;
	teamId: string;
}) {
	const team = await db.query.teamsTable.findFirst({
		where: eq(teamsTable.id, teamId),
		with: {
			subscription: true,
		},
	});

	if (!team) {
		throw new Error("Team not found");
	}

	const storageQuota = team.subscription.storageQuota;

	const [row] = await db
		.select({ sum: sum(imagesTable.size) })
		.from(imagesTable)
		.where(eq(imagesTable.projectId, projectId));

	if (Number(row.sum) + kilobytes > storageQuota) {
		throw createError({
			statusCode: 403,
			statusMessage: "Storage quota reached for this project",
		});
	}
}
