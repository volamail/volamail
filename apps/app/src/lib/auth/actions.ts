import { eq } from "drizzle-orm";
import { generateState } from "arctic";
import { customAlphabet } from "nanoid";
import { getRequestEvent } from "solid-js/web";
import { action, redirect } from "@solidjs/router";
import { appendHeader, createError, setCookie } from "vinxi/http";
import { email, object, optional, parseAsync, pipe, string } from "valibot";

import { db } from "../db";
import { lucia } from "./lucia";
import { createGithubAuth } from "./github";
import { parseFormData } from "../server-utils";
import { getUserProjects } from "../projects/utils";
import { bootstrapUser } from "../users/server-utils";
import { mailCodesTable, usersTable } from "../db/schema";

export const loginWithGithub = action(async (formData: FormData) => {
  "use server";

  const body = await parseFormData(
    object({
      to: optional(string()),
    }),
    formData
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

export const sendEmailOtp = action(async (formData: FormData) => {
  "use server";

  const body = await parseFormData(
    object({
      email: pipe(string(), email()),
      to: optional(string()),
    }),
    formData
  );

  const [user] = await Promise.all([
    db.query.usersTable.findFirst({
      where: eq(usersTable.email, body.email),
      columns: { id: true },
    }),
    db.delete(mailCodesTable).where(eq(mailCodesTable.email, body.email)),
  ]);

  const nanoid = customAlphabet("0123456789", 6);

  const code = nanoid();

  await db.insert(mailCodesTable).values({
    email: body.email,
    code,
    expiresAt: new Date(Date.now() + 1000 * 60 * 15),
  });

  console.log("GENERATED CODE:", code);

  // await sendMail({
  //   from: "noreply@volamail.com",
  //   to: body.email,
  //   subject: "Here's your login code",
  //   body:
  // })

  const searchParams = new URLSearchParams();

  if (body.to) {
    searchParams.set("to", body.to);
  }

  throw redirect(`/verify-mail-otp/${body.email}?${searchParams.toString()}`);
});

export const verifyEmailOtp = action(async (formData: FormData) => {
  "use server";

  const body = await parseFormData(
    object({
      email: pipe(string(), email()),
      code: string(),
      to: optional(string()),
    }),
    formData
  );

  const code = await db.query.mailCodesTable.findFirst({
    where: eq(mailCodesTable.email, body.email),
  });

  if (
    !code ||
    Date.now() - code.expiresAt.getTime() > 0 ||
    code.code !== body.code
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Bad code",
    });
  }

  const [existingUser] = await Promise.all([
    db.query.usersTable.findFirst({
      where: eq(usersTable.email, body.email),
      columns: { id: true },
    }),
    db.delete(mailCodesTable).where(eq(mailCodesTable.email, body.email)),
  ]);

  const { nativeEvent } = getRequestEvent()!;

  if (existingUser) {
    await lucia.invalidateUserSessions(existingUser.id);

    const [session, projects] = await Promise.all([
      lucia.createSession(existingUser.id, {}),
      getUserProjects(existingUser.id),
    ]);

    appendHeader(
      nativeEvent,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

    if (body.to) {
      throw redirect(body.to);
    }

    const project = projects.teams.find((t) => t.projects.length > 0)
      ?.projects[0]!;

    throw redirect(`/t/${project.teamId}/p/${project.id}/emails`);
  }

  const {
    id: userId,
    defaultProjectId,
    defaultTeamId,
  } = await bootstrapUser(body.email);

  const session = await lucia.createSession(userId, {});

  appendHeader(
    nativeEvent,
    "Set-Cookie",
    lucia.createSessionCookie(session.id).serialize()
  );

  if (body.to) {
    throw redirect(body.to);
  }

  throw redirect(`/t/${defaultTeamId}/p/${defaultProjectId}/emails`);
});
