import {
  getQuery,
  getCookie,
  createError,
  appendHeader,
  sendRedirect,
} from "vinxi/http";
import { and, eq } from "drizzle-orm";
import { OAuth2RequestError } from "arctic";
import type { APIEvent } from "@solidjs/start/server";

import { db } from "~/lib/db";
import { lucia } from "~/lib/auth/lucia";
import { createGithubAuth } from "~/lib/auth/github";
import { bootstrapUser } from "~/lib/users/server-utils";
import { usersTable } from "~/lib/db/schema";

export async function GET({ nativeEvent }: APIEvent) {
  const query = getQuery(nativeEvent);

  const code = query.code?.toString() ?? null;
  const state = query.state?.toString() ?? null;
  const storedState = getCookie(nativeEvent, "github_oauth_state") ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    throw createError({
      status: 400,
    });
  }

  try {
    const github = createGithubAuth();

    const tokens = await github.validateAuthorizationCode(code);

    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    const githubUser: GitHubUser = await githubUserResponse.json();

    const githubUserEmailResponse = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );

    const userEmails: Array<{ email: string; primary?: boolean }> =
      await githubUserEmailResponse.json();

    const userEmail = userEmails.find((email) => email.primary)
      ?.email as string;

    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, userEmail),
    });

    if (existingUser) {
      if (!existingUser.githubId) {
        await db
          .update(usersTable)
          .set({ githubId: githubUser.id })
          .where(eq(usersTable.id, existingUser.id));
      }

      const session = await lucia.createSession(existingUser.id, {});

      appendHeader(
        nativeEvent,
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      );

      if (query.to?.toString()) {
        return sendRedirect(nativeEvent, query.to.toString());
      }

      return sendRedirect(nativeEvent, `/teams`);
    }

    const {
      id: userId,
      defaultProjectId,
      defaultTeamId,
    } = await bootstrapUser(userEmail);

    const session = await lucia.createSession(userId, {});

    appendHeader(
      nativeEvent,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

    if (query.to?.toString()) {
      return sendRedirect(nativeEvent, query.to.toString());
    }

    return sendRedirect(
      nativeEvent,
      `/t/${defaultTeamId}/p/${defaultProjectId}/emails`
    );
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      throw createError({
        status: 400,
      });
    }

    throw createError({
      status: 500,
    });
  }
}

interface GitHubUser {
  id: number;
  login: string;
}
