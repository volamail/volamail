import { DateTime } from "luxon";
import { and, eq } from "drizzle-orm";
import { generateState } from "arctic";
import { customAlphabet } from "nanoid";
import { getRequestEvent } from "solid-js/web";
import { action, redirect } from "@solidjs/router";
import { appendHeader, createError, setCookie } from "vinxi/http";
import { email, object, optional, pipe, string, toLowerCase } from "valibot";

import { db } from "../db";
import { lucia } from "./lucia";
import { requireUser } from "./utils";
import { sendMail } from "../mail/send";
import { env } from "../environment/env";
import { createGithubAuth } from "./github";
import * as analytics from "~/lib/analytics";
import { parseFormData } from "../server-utils";
import { getUserTeams } from "../teams/queries";
import { createUser } from "../users/mutations";
import { mailCodesTable, usersTable } from "../db/schema";
import otpTemplate from "../static-templates/mail-otp.html?raw";

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
      email: pipe(string(), email(), toLowerCase()),
      to: optional(string()),
    }),
    formData
  );

  await db.delete(mailCodesTable).where(eq(mailCodesTable.email, body.email));

  const nanoid = customAlphabet("0123456789", 6);

  const code = nanoid();

  await db.insert(mailCodesTable).values({
    email: body.email,
    code,
    expiresAt: DateTime.now().plus({ minutes: 15 }).toJSDate(),
  });

  if (import.meta.env.DEV) {
    console.log("GENERATED EMAIL OTP:", code);
  } else {
    await sendMail({
      from: env.NOREPLY_EMAIL,
      to: body.email,
      subject: "Here's your login code",
      body: otpTemplate,
      data: {
        otp: code,
      },
    });
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
      email: pipe(string(), email(), toLowerCase()),
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

    const [session, teams] = await Promise.all([
      lucia.createSession(existingUser.id, {}),
      getUserTeams(existingUser.id),
    ]);

    appendHeader(
      nativeEvent,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

    if (body.to) {
      console.log("FOUND BODY.TO");
      throw redirect(body.to);
    }

    const project = [
      ...(teams.personal ? [teams.personal] : []),
      ...teams.other,
    ].find((t) => t.projects.length > 0)?.projects[0];

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
  } = await createUser({
    email: body.email,
  });

  analytics.captureUserRegisteredEvent({
    id: userId,
    email: body.email,
  });

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

export const changeEmail = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const body = await parseFormData(
    object({
      email: pipe(string(), toLowerCase()),
    }),
    formData
  );

  if (user.email === body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: "New email is the same as the current one",
    });
  }

  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, body.email),
  });

  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email already in use",
    });
  }

  const nanoid = customAlphabet("0123456789", 6);

  const code = nanoid();

  await db.delete(mailCodesTable).where(eq(mailCodesTable.email, body.email));

  await db.insert(mailCodesTable).values({
    code,
    email: body.email,
    expiresAt: DateTime.now().plus({ minutes: 10 }).toJSDate(),
    userId: user.id,
  });

  if (import.meta.env.PROD) {
    await sendMail({
      from: env.NOREPLY_EMAIL,
      to: body.email,
      subject: `Your email change verification code`,
      body: otpTemplate,
      data: {
        otp: code,
      },
    });
  } else {
    console.log("GENERATED EMAIL OTP:", code);
  }

  return {
    success: true,
    data: {
      email: body.email,
    },
  };
});

export const verifyEmailChangeOtp = action(async (formData: FormData) => {
  "use server";

  const body = await parseFormData(
    object({
      email: pipe(string(), email(), toLowerCase()),
      code: string(),
    }),
    formData
  );

  const user = requireUser();

  const code = await db.query.mailCodesTable.findFirst({
    where: and(
      eq(mailCodesTable.email, body.email),
      eq(mailCodesTable.code, body.code),
      eq(mailCodesTable.userId, user.id)
    ),
  });

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad code",
    });
  }

  if (DateTime.fromJSDate(code.expiresAt).diffNow().seconds < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Code expired",
    });
  }

  await Promise.all([
    db
      .update(usersTable)
      .set({ email: body.email })
      .where(eq(usersTable.id, user.id)),
    db
      .delete(mailCodesTable)
      .where(
        and(
          eq(mailCodesTable.code, body.code),
          eq(mailCodesTable.userId, user.id)
        )
      ),
  ]);

  return {
    success: true,
  };
});
