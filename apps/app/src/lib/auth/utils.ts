import { getRequestEvent } from "solid-js/web";
import { createError } from "vinxi/http";

export function requireUser() {
  const event = getRequestEvent();

  if (!event) {
    throw new Error("[volamail] Requested event outside of a request");
  }

  const user = event.locals.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  return user;
}
