import { customAlphabet } from "nanoid";
import slugify from "slugify";
import { db } from "../database";
import {
	projectsTable,
	teamMembersTable,
	teamsTable,
} from "../database/schema";
import { createFreeTierSubscription } from "../payments/subscriptions";

const customNanoId = customAlphabet("01234567890abcdefghijklmnopqrstuvwxyz");

export async function generateValidTeamIdFromName(name: string) {
	let id = slugify(name, { lower: true, strict: true });

	const existingTeam = await db.query.teamsTable.findFirst({
		where: (_, { eq }) => eq(teamsTable.id, id),
		columns: {
			id: true,
		},
	});

	if (existingTeam) {
		id = `${id}-${customNanoId(6)}`;
	}

	return id;
}

export async function createTeam(params: {
	id: string;
	name: string;
	userId: string;
}) {
	const { id, name } = params;

	const defaultProjectId = await db.transaction(async (db) => {
		await db.insert(teamsTable).values({
			id,
			name,
		});

		await createFreeTierSubscription(id, db);

		await db.insert(teamMembersTable).values({
			teamId: id,
			userId: params.userId,
		});

		const [{ insertedId: projectId }] = await db
			.insert(projectsTable)
			.values({
				id: customNanoId(6),
				teamId: id,
				name: "Untitled project",
			})
			.returning({ insertedId: projectsTable.id });

		return projectId;
	});

	return {
		id,
		defaultProjectId,
	};
}
