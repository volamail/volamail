import { action, redirect } from "@solidjs/router";
import { and, eq } from "drizzle-orm";
import { getRequestEvent } from "solid-js/web";

import { deleteSessionCookie } from "../auth/cookies";
import { invalidateAllUserSessions } from "../auth/sessions";
import { requireUser } from "../auth/utils";
import { db } from "../db";
import {
	sessionsTable,
	teamMembersTable,
	teamsTable,
	usersTable,
} from "../db/schema";
import { deleteProjectWithCleanup } from "../projects/utils";
import { getUserTeams } from "../teams/queries";

export const deleteAccount = action(async () => {
	"use server";

	const user = requireUser();

	const teams = await getUserTeams(user.id);

	await db.transaction(async (db) => {
		await Promise.all(
			teams.personal!.projects.map((project) =>
				deleteProjectWithCleanup(project.id),
			),
		);

		for (const team of teams.other) {
			if (team.members.length === 1) {
				await Promise.all(
					team.projects.map((project) => deleteProjectWithCleanup(project.id)),
				);

				await db
					.delete(teamMembersTable)
					.where(
						and(
							eq(teamMembersTable.teamId, team.id),
							eq(teamMembersTable.userId, user.id),
						),
					);
				await db.delete(teamsTable).where(eq(teamsTable.id, team.id));
			} else {
				await db
					.delete(teamMembersTable)
					.where(
						and(
							eq(teamMembersTable.teamId, team.id),
							eq(teamMembersTable.userId, user.id),
						),
					);
			}
		}

		await db.delete(sessionsTable).where(eq(sessionsTable.userId, user.id));

		await db
			.delete(teamMembersTable)
			.where(
				and(
					eq(teamMembersTable.userId, user.id),
					eq(teamMembersTable.teamId, teams.personal!.id),
				),
			);

		await db.delete(usersTable).where(eq(usersTable.id, user.id));

		await db.delete(teamsTable).where(eq(teamsTable.id, teams.personal!.id));
	});

	const { nativeEvent } = getRequestEvent()!;

	await invalidateAllUserSessions(user.id);

	deleteSessionCookie(nativeEvent);

	throw redirect("/login");
});
