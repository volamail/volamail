import { createMiddleware } from "@solidjs/start/middleware";
import { appendHeader, createError, getCookie } from "vinxi/http";
import { type Session, type User, verifyRequestOrigin } from "lucia";
import { lucia } from "./lib/auth/lucia";

export default createMiddleware({
  onRequest: async (solidEvent) => {
    const { nativeEvent: event, request, response, locals } = solidEvent;

    if (request.method !== "GET") {
      const hostHeader = request.headers.get("Host") ?? null;
      const originHeader = request.headers.get("Origin") ?? null;

      if (
        !originHeader ||
        !hostHeader ||
        !verifyRequestOrigin(originHeader, [hostHeader])
      ) {
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
        lucia.createSessionCookie(session.id).serialize()
      );
    }

    if (!session) {
      appendHeader(
        event,
        "Set-Cookie",
        lucia.createBlankSessionCookie().serialize()
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
