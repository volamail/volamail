import { getUserTeamsWithProjects } from "@/modules/organization/projects";
import { authenticationMiddleware } from "@/modules/rpcs/server-functions";
import { createServerFn } from "@tanstack/start";
import { getSessionCookie } from "../cookies";
import { validateSessionToken } from "../sessions";

export const getCurrentUserFn = createServerFn({ method: "GET" })
	.middleware([authenticationMiddleware])
	.handler(async () => {
		const sessionToken = getSessionCookie();

		if (!sessionToken) {
			return null;
		}

		const { user } = await validateSessionToken(sessionToken);

		if (!user) {
			return null;
		}

		const teams = await getUserTeamsWithProjects(user.id);

		const defaultProject = teams[0].projects[0];

		return {
			...user,
			teams,
			defaultProject,
		};
	});
