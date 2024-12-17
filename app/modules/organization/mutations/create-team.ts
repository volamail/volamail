import { db } from "@/modules/database";
import { teamMembersTable, teamsTable } from "@/modules/database/schema";
import { err, ok } from "@/modules/rpcs/errors";
import { authenticationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import slugify from "slugify";
import { z } from "zod";
import { createTeam } from "../teams";

export const createTeamFn = createServerFn({ method: "POST" })
	.middleware([authenticationMiddleware])
	.validator(
		zodValidator(
			z.object({
				id: z
					.string()
					.trim()
					.min(3)
					.max(32)
					.refine((id) => slugify(id, { lower: true, strict: true }) === id),
				name: z.string().trim().min(3).max(32),
			}),
		),
	)
	.handler(async ({ data, context }) => {
		const { user } = context;

		const userTeams = await db.query.teamMembersTable.findMany({
			where: eq(teamMembersTable.userId, user.id),
		});

		if (userTeams.length >= 3) {
			return err("TEAM_LIMIT_REACHED" as const);
		}

		const existing = await db.query.teamsTable.findFirst({
			where: eq(teamsTable.id, data.id),
			columns: {
				id: true,
			},
		});

		if (existing) {
			return err("TEAM_ID_TAKEN" as const);
		}

		const { defaultProjectId } = await db.transaction(async (db) => {
			const { defaultProjectId } = await createTeam({
				id: data.id,
				name: data.name,
			});

			await db.insert(teamMembersTable).values({
				userId: user.id,
				teamId: data.id,
			});

			return { defaultProjectId };
		});

		return ok({
			id: data.id,
			defaultProjectId,
		});
	});
