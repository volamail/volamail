import { action, redirect } from "@solidjs/router";
import { generateState } from "arctic";
import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { getRequestEvent } from "solid-js/web";
import { email, object, optional, parseAsync, pipe, string } from "valibot";
import { appendHeader, createError, setCookie } from "vinxi/http";

import { db } from "../db";
import { mailCodesTable, usersTable, waitlistTable } from "../db/schema";
import { sendMail } from "../mail/send";
import { getUserProjects } from "../projects/utils";
import { parseFormData } from "../server-utils";
import otpTemplate from "../static-templates/mail-otp.html?raw";
import { bootstrapUser } from "../users/server-utils";
import { createGithubAuth } from "./github";
import { lucia } from "./lucia";

export const loginWithGithub = action(async (formData: FormData) => {
  "use server";

  const body = await parseFormData(
    object({
      to: optional(string()),
    }),
    formData
  );

  const state = generateState();

  // biome-ignore lint/style/noNonNullAssertion: Request event is safe in server action
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

  // biome-ignore lint/style/noNonNullAssertion: Request event is safe in server action
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

  const waitlistApproval = await db.query.waitlistTable.findFirst({
    where: and(
      eq(waitlistTable.email, body.email),
      eq(waitlistTable.approved, true)
    ),
    columns: {
      email: true,
    },
  });

  if (!waitlistApproval) {
    throw createError({
      statusCode: 403,
      statusMessage: "Email not approved yet",
    });
  }

  await db.delete(mailCodesTable).where(eq(mailCodesTable.email, body.email));

  const nanoid = customAlphabet("0123456789", 6);

  const code = nanoid();

  await db.insert(mailCodesTable).values({
    email: body.email,
    code,
    expiresAt: new Date(Date.now() + 1000 * 60 * 15),
  });

  if (import.meta.env.DEV) {
    console.log("GENERATED EMAIL OTP:", code);
  } else {
    await sendMail({
      from: "noreply@volamail.com",
      to: body.email,
      subject: "Here's your login code",
      body: otpTemplate,
      data: {
        otp: code,
      },
    })
  }


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

  // biome-ignore lint/style/noNonNullAssertion: Request event is safe in server action
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
      ?.projects[0];

    if (!project) {
      throw createError({
        statusCode: 409,
        statusMessage: "No project found",
      });
    }

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
