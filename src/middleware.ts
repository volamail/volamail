import { createMiddleware } from "@solidjs/start/middleware";
import { appendHeader, createError, getCookie } from "vinxi/http";
import { type Session, type User, verifyRequestOrigin } from "lucia";

import { lucia } from "./lib/auth/lucia";
import { env } from "~/lib/environment/env";
import { redirect } from "@solidjs/router";

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
			const hostHeader = request.headers.get("Host") ?? null;
			const originHeader = request.headers.get("Origin") ?? null;

			const origin = new URL(originHeader || "https://volamail.com");

			origin.hostname = clearSubdomain(origin.hostname);

			if (
				!hostHeader ||
				!verifyRequestOrigin(origin.toString(), [clearSubdomain(hostHeader)])
			) {
				console.warn("CSRF protection triggered");

				throw createError({
					status: 403,
				});
			}
		}

		const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

		if (!sessionId) {
			locals.session = null;
			locals.user = null;

			return;
		}

		const { session, user } = await lucia.validateSession(sessionId);

		if (session?.fresh) {
			appendHeader(
				event,
				"Set-Cookie",
				lucia.createSessionCookie(session.id).serialize(),
			);
		}

		if (!session) {
			appendHeader(
				event,
				"Set-Cookie",
				lucia.createBlankSessionCookie().serialize(),
			);
		}

		locals.session = session;
		locals.user = user;
	},
});

declare module "@solidjs/start/server" {
	interface RequestEventLocals {
		user: User | null;
		session: Session | null;
	}
}

function clearSubdomain(url: string) {
	const parts = url.split(".");

	if (parts.length < 3) {
		return url;
	}

	return parts.slice(1).join(".");
}
