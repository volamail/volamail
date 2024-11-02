import { createMiddleware } from "@solidjs/start/middleware";
import { createError, deleteCookie, getCookie } from "vinxi/http";

import { redirect } from "@solidjs/router";
import { env } from "~/lib/environment/env";
import {
	deleteSessionCookie,
	getSessionCookie,
	setSessionCookie,
} from "./lib/auth/cookies";
import { validateSessionToken } from "./lib/auth/sessions";
import type { DbSession, DbUser } from "./lib/db/schema";

export default createMiddleware({
	onRequest: async (solidEvent) => {
		const { nativeEvent: event, request, locals } = solidEvent;

		const pathname = new URL(request.url).pathname;

		if (
			request.method === "GET" &&
			env.MAINTENANCE_MODE === "true" &&
			pathname !== "/maintenance" &&
			!pathname.startsWith("/api") &&
			!pathname.includes(".") // TODO: Avoid static assets in a safer way
		) {
			return redirect("/maintenance");
		}

		if (request.method !== "GET" && import.meta.env.PROD) {
			const hostHeader =
				request.headers.get("Host") ??
				request.headers.get("X-Forwarded-Host") ??
				null;
			const originHeader = request.headers.get("Origin") ?? null;

			if (originHeader === null || originHeader !== hostHeader) {
				console.warn("CSRF protection triggered");

				throw createError({
					status: 403,
				});
			}
		}

		const sessionToken = getSessionCookie(event);

		if (!sessionToken) {
			locals.session = null;
			locals.user = null;

			return;
		}

		const { session, user } = await validateSessionToken(sessionToken);

		if (session) {
			setSessionCookie(event, sessionToken, session.expiresAt);
		}

		if (!session) {
			deleteSessionCookie(event);
		}

		locals.session = session;
		locals.user = user;
	},
});

declare module "@solidjs/start/server" {
	interface RequestEventLocals {
		user: DbUser | null;
		session: DbSession | null;
	}
}
