import type { APIEvent } from "@solidjs/start/server";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { createError, getCookie, getQuery, sendRedirect } from "vinxi/http";

import * as analytics from "~/lib/analytics";
import { setSessionCookie } from "~/lib/auth/cookies";
import { createGithubAuth } from "~/lib/auth/github";
import { createSession, generateSessionToken } from "~/lib/auth/sessions";
import { db } from "~/lib/db";
import { usersTable } from "~/lib/db/schema";
import { createUser } from "~/lib/users/mutations";

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

		const accessToken = tokens.accessToken();

		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const githubUser: GitHubUser = await githubUserResponse.json();

		const githubUserEmailResponse = await fetch(
			"https://api.github.com/user/emails",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);

		const userEmails: Array<{ email: string; primary?: boolean }> =
			await githubUserEmailResponse.json();

		const userEmail = userEmails.find((email) => email.primary)
			?.email as string;

		const existingUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.email, userEmail),
		});

		const sessionToken = generateSessionToken();

		if (existingUser) {
			if (!existingUser.githubId) {
				await db
					.update(usersTable)
					.set({ githubId: githubUser.id })
					.where(eq(usersTable.id, existingUser.id));
			}

			analytics.captureUserLoggedInEvent({
				id: existingUser.id,
				email: existingUser.email,
			});

			const session = await createSession(sessionToken, existingUser.id);

			setSessionCookie(nativeEvent, sessionToken, session.expiresAt);

			if (query.to?.toString()) {
				return sendRedirect(nativeEvent, query.to.toString());
			}

			return sendRedirect(nativeEvent, "/teams");
		}

		const {
			id: userId,
			defaultProjectId,
			defaultTeamId,
		} = await createUser({ email: userEmail, githubId: githubUser.id });

		analytics.captureUserRegisteredEvent({
			id: userId,
			email: userEmail,
		});

		const session = await createSession(sessionToken, userId);

		setSessionCookie(nativeEvent, sessionToken, session.expiresAt);

		if (query.to?.toString()) {
			return sendRedirect(nativeEvent, query.to.toString());
		}

		return sendRedirect(
			nativeEvent,
			`/t/${defaultTeamId}/p/${defaultProjectId}/emails`,
		);
	} catch (e) {
		console.log(e);

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
