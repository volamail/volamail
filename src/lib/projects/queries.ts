import { cache, redirect } from "@solidjs/router";
import { and, eq } from "drizzle-orm";
import { createError } from "vinxi/http";

import { requireUser } from "../auth/utils";
import { db } from "../db";
import { type DbUser, projectsTable, teamsTable } from "../db/schema";
import { requireUserToBeMemberOfTeam } from "./utils";

export const getCurrentUserDefaultProject = cache(async () => {
	"use server";

	let user: DbUser;
	try {
		user = requireUser();
	} catch {
		throw redirect("/login");
	}

	const personalTeam = await db.query.teamsTable.findFirst({
		where: eq(teamsTable.id, user.personalTeamId),
		with: {
			projects: true,
		},
	});

	const project = personalTeam?.projects[0];

	if (!project) {
		// TODO: Maybe create a default project here
		throw createError({
			statusCode: 500,
			statusMessage: "No user project found",
		});
	}

	return project;
}, "default-project");

export const getProject = cache(
	async ({ teamId, projectId }: { teamId: string; projectId: string }) => {
		"use server";

		const user = requireUser();

		await requireUserToBeMemberOfTeam({
			userId: user.id,
			teamId: teamId,
		});

		return await db.query.projectsTable.findFirst({
			where: and(
				eq(projectsTable.teamId, teamId),
				eq(projectsTable.id, projectId),
			),
		});
	},
	"project",
);
