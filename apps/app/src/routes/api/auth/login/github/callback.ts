import {
  getQuery,
  getCookie,
  createError,
  appendHeader,
  sendRedirect,
} from "vinxi/http";
import { eq } from "drizzle-orm";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import type { APIEvent } from "@solidjs/start/server";

import {
  teamsTable,
  usersTable,
  teamMembersTable,
  subscriptionsTable,
} from "~/lib/db/schema";
import { db } from "~/lib/db";
import { lucia } from "~/lib/auth/lucia";
import { github } from "~/lib/auth/github";
import { getUserProjects } from "~/lib/projects/utils";
import { projectsTable } from "~/lib/db/schema/projects.sql";
import { SUBSCRIPTION_QUOTAS } from "~/lib/subscriptions/constants";

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

      const [session, projects] = await Promise.all([
        lucia.createSession(existingUser.id, {}),
        getUserProjects(existingUser.id),
      ]);

      const project = projects.teams.find((t) => t.projects.length > 0)
        ?.projects[0]!;

      appendHeader(
        nativeEvent,
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      );

      return sendRedirect(
        nativeEvent,
        `/t/${project.teamId || 0}/p/${project.id}/emails`
      );
    }

    const userId = generateIdFromEntropySize(10);

    const { defaultProjectId, defaultTeamId } = await db.transaction(
      async (db) => {
        const [{ insertedId: subscriptionId }] = await db
          .insert(subscriptionsTable)
          .values({
            tier: "FREE",
            status: "ACTIVE",
            monthlyQuota: SUBSCRIPTION_QUOTAS["FREE"],
            remainingQuota: SUBSCRIPTION_QUOTAS["FREE"],
            renewsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            lastRefilledAt: new Date(),
            periodType: "MONTHLY",
            price: "0.00",
          })
          .returning({ insertedId: subscriptionsTable.id });

        const [{ insertedId: defaultTeamId }] = await db
          .insert(teamsTable)
          .values({
            name: `${userEmail}'s team`,
            subscriptionId,
          })
          .returning({ insertedId: teamsTable.id });

        await db.insert(usersTable).values({
          id: userId,
          email: userEmail,
          githubId: githubUser.id,
          personalTeamId: defaultTeamId,
        });

        await db.insert(teamMembersTable).values({
          userId: userId,
          teamId: defaultTeamId,
        });

        const [{ insertedId: defaultProjectId }] = await db
          .insert(projectsTable)
          .values({
            name: "Untitled project",
            teamId: defaultTeamId,
            creatorId: userId,
          })
          .returning({ insertedId: projectsTable.id });

        return {
          defaultProjectId,
          defaultTeamId,
        };
      }
    );

    const session = await lucia.createSession(userId, {});

    appendHeader(
      nativeEvent,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

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
