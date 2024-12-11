import { db } from "@/modules/database";
import { teamInvitesTable, teamsTable } from "@/modules/database/schema";
import { serverEnv } from "@/modules/environment/server";
import { teamAuthorizationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { sendEmail } from "@/modules/sending";
import { createServerFn } from "@tanstack/start";
import { addHours } from "date-fns";
import { and, eq, lt } from "drizzle-orm";
import { ulid } from "ulid";
import { createError, getHeader, getWebRequest } from "vinxi/http";
import { z } from "zod";
import teamInviteTemplate from "./templates/team-invite.html?raw";

export const sendTeamInviteFn = createServerFn({
	method: "POST",
})
	.middleware([teamAuthorizationMiddleware])
	.validator(
		zodValidator(
			z.object({
				teamId: z.string(),
				email: z.string().email(),
			}),
		),
	)
	.handler(async ({ data, context }) => {
		const team = await db.query.teamsTable.findFirst({
			where: eq(teamsTable.id, data.teamId),
		});

		if (!team) {
			throw createError({
				status: 404,
				message: "Team not found",
			});
		}

		const existingInvite = await db.query.teamInvitesTable.findFirst({
			where: and(
				eq(teamInvitesTable.teamId, data.teamId),
				eq(teamInvitesTable.email, data.email),
				lt(teamInvitesTable.expiresAt, new Date()),
			),
		});

		let inviteCode = ulid();

		if (existingInvite) {
			await db
				.update(teamInvitesTable)
				.set({
					expiresAt: addHours(new Date(), 48),
				})
				.where(eq(teamInvitesTable.code, existingInvite.code));

			inviteCode = existingInvite.code;
		} else {
			await db
				.delete(teamInvitesTable)
				.where(
					and(
						eq(teamInvitesTable.teamId, data.teamId),
						eq(teamInvitesTable.email, data.email),
					),
				);

			await db.insert(teamInvitesTable).values({
				code: inviteCode,
				email: data.email,
				teamId: data.teamId,
				expiresAt: addHours(new Date(), 48),
			});
		}

		const request = getWebRequest();

		const origin = request.headers.get("origin") || request.headers.get("host");

		const link = `${origin}/join-team/${inviteCode}`;

		await sendEmail({
			from: {
				address: serverEnv.NOREPLY_EMAIL,
				label: "Volamail",
			},
			to: data.email,
			subject: `You've been invited to join ${team.name}`,
			text: `You've been invited to join ${team.name}. Use the following link to join: ${link}`,
			html: teamInviteTemplate,
			data: {
				team_name: team.name,
				link: link,
			},
		});
	});
