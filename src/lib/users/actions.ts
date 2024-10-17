import { and, eq } from "drizzle-orm";
import { appendHeader } from "vinxi/http";
import { getRequestEvent } from "solid-js/web";
import { action, redirect } from "@solidjs/router";

import {
	usersTable,
	teamsTable,
	sessionsTable,
	teamMembersTable,
} from "../db/schema";
import { db } from "../db";
import { lucia } from "../auth/lucia";
import { requireUser } from "../auth/utils";
import { getUserTeams } from "../teams/queries";
import { deleteProjectWithCleanup } from "../projects/utils";

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

	appendHeader(
		nativeEvent,
		"Set-Cookie",
		lucia.createBlankSessionCookie().serialize(),
	);

	throw redirect("/login");
});
