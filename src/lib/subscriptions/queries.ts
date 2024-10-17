import { eq } from "drizzle-orm";
import { cache } from "@solidjs/router";
import { createError } from "vinxi/http";

import { db } from "../db";
import { teamsTable } from "../db/schema";
import { requireUser } from "../auth/utils";
import { requireUserToBeMemberOfTeam } from "../projects/utils";

export const getTeamSubcription = cache(async (teamId: string) => {
	"use server";

	const user = requireUser();

	await requireUserToBeMemberOfTeam({
		userId: user.id,
		teamId,
	});

	const team = await db.query.teamsTable.findFirst({
		where: eq(teamsTable.id, teamId),
		with: {
			subscription: true,
		},
	});

	if (!team) {
		throw createError({
			statusCode: 404,
			statusMessage: "Team not found",
		});
	}

	return team.subscription;
}, "subscription");
