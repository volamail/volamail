import { ulid } from "ulid";
import { db } from "../database";
import { type DbUser, teamMembersTable, usersTable } from "../database/schema";
import { createTeam, generateValidTeamIdFromName } from "../organization/teams";

export async function createUser(
	email: string,
	fields: {
		githubId?: number;
		avatarUrl?: string;
		name?: string;
	} = {},
) {
	const id = ulid();

	const name = fields.name || email.split("@")[0];

	const teamId = await generateValidTeamIdFromName(name);

	const { user, defaults } = await db.transaction(async (db) => {
		const { defaultProjectId } = await createTeam({
			id: teamId,
			name: `${name}'s Team`,
		});

		const user: DbUser = {
			id,
			email,
			name,
			personalTeamId: teamId,
			githubId: fields.githubId || null,
			avatarUrl: fields.avatarUrl || null,
		};

		await db.insert(usersTable).values(user);

		await db.insert(teamMembersTable).values({
			teamId,
			userId: id,
		});

		return {
			user,
			defaults: {
				teamId,
				projectd: defaultProjectId,
			},
		};
	});

	return {
		user,
		defaults,
	};
}
