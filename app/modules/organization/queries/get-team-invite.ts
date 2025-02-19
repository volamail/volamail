import { db } from "@/modules/database";
import { teamInvitesTable } from "@/modules/database/schema";
import { err, ok } from "@/modules/rpcs/errors";
import { authenticationMiddleware } from "@/modules/rpcs/server-functions";
import { zodValidator } from "@/modules/rpcs/validator";
import { createServerFn } from "@tanstack/start";
import { compareAsc } from "date-fns";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getTeamInviteFn = createServerFn({ method: "GET" })
	.middleware([authenticationMiddleware])
	.validator(
		zodValidator(
			z.object({
				code: z.string(),
			}),
		),
	)
	.handler(async ({ data }) => {
		const invite = await db.query.teamInvitesTable.findFirst({
			where: eq(teamInvitesTable.code, data.code),
			with: {
				team: true,
			},
		});

		if (!invite) {
			return err("NOT_FOUND");
		}

		if (compareAsc(new Date(), invite.expiresAt) === 1) {
			return err("EXPIRED");
		}

		return ok(invite);
	});
