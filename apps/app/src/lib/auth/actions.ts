import { generateState } from "arctic";
import { getRequestEvent } from "solid-js/web";
import { action, redirect } from "@solidjs/router";
import { appendHeader, createError, setCookie } from "vinxi/http";

import { lucia } from "./lucia";
import { createGithubAuth } from "./github";
import { object, optional, parseAsync, string } from "valibot";

export const loginWithGithub = action(async (formData: FormData) => {
  "use server";

  const entries = Object.fromEntries(formData);

  const body = await parseAsync(
    object({
      to: optional(string()),
    }),
    entries
  );

  const state = generateState();

  const { nativeEvent } = getRequestEvent()!;

  const github = createGithubAuth({
    to: body.to,
  });

  const url = await github.createAuthorizationURL(state, {
    scopes: ["user:email"],
  });

  setCookie(nativeEvent, "github_oauth_state", state, {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 10,
  });

  throw redirect(url.toString());
}, "user");

export const logout = action(async () => {
  "use server";

  const { locals, nativeEvent } = getRequestEvent()!;

  if (!locals.session) {
    throw createError({
      statusCode: 403,
    });
  }

  await lucia.invalidateSession(locals.session.id);

  appendHeader(
    nativeEvent,
    "Set-Cookie",
    lucia.createBlankSessionCookie().serialize()
  );

  throw redirect("/login");
}, "user");
