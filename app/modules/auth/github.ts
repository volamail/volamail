import { serverEnv } from "@/modules/environment/server";
import { GitHub, generateState } from "arctic";
import { eq } from "drizzle-orm";
import {
	createError,
	deleteCookie,
	getCookie,
	getWebRequest,
	setCookie,
} from "vinxi/http";
import { db } from "../database";
import { usersTable } from "../database/schema";
import { getOrigin } from "../rpcs/origin";
import { setSessionCookie } from "./cookies";
import { createSession, generateSessionToken } from "./sessions";
import { createUser } from "./users";

export const GITHUB_OAUTH_STATE_COOKIE_NAME = "github_oauth_state";

export async function signInWithGithub() {
	const githubOauth = createGithubOauth();

	const state = generateState();

	const redirectUrl = githubOauth.createAuthorizationURL(state, ["user:email"]);

	setCookie(GITHUB_OAUTH_STATE_COOKIE_NAME, state, {
		secure: import.meta.env.PROD,
		httpOnly: true,
		sameSite: "lax",
		maxAge: 60 * 10,
	});

	return redirectUrl.toString();
}

export async function handleGithubCallback(request: Request) {
	const url = new URL(request.url);

	const query = url.searchParams;

	const code = query.get("code");
	const state = query.get("state");

	const storedState = getCookie(GITHUB_OAUTH_STATE_COOKIE_NAME);

	if (!code || !state || !storedState || state !== storedState) {
		throw createError({
			status: 400,
		});
	}

	deleteCookie(GITHUB_OAUTH_STATE_COOKIE_NAME);

	const githubOauth = createGithubOauth();

	const tokens = await githubOauth.validateAuthorizationCode(code);

	const accessToken = tokens.accessToken();

	const [githubUser, email] = await Promise.all([
		getGithubUserFromToken(accessToken),
		getGithubUserEmailFromToken(accessToken),
	]);

	let user = await db.query.usersTable.findFirst({
		where: eq(usersTable.email, email),
	});

	const sessionToken = generateSessionToken();

	if (user) {
		if (!user.githubId) {
			await db
				.update(usersTable)
				.set({
					githubId: githubUser.id,
					avatarUrl: githubUser.avatar_url,
					name: githubUser.login,
				})
				.where(eq(usersTable.id, user.id));
		}
	} else {
		const { user: createdUser } = await createUser(email, {
			githubId: githubUser.id,
			avatarUrl: githubUser.avatar_url,
			name: githubUser.login,
		});

		user = createdUser;
	}

	const session = await createSession(sessionToken, user.id);

	setSessionCookie(sessionToken, session.expiresAt);

	return user;
}

function createGithubOauth() {
	return new GitHub(
		serverEnv.GITHUB_CLIENT_ID,
		serverEnv.GITHUB_CLIENT_SECRET,
		`${getOrigin()}/api/internal/auth/oauth/github/callback`,
	);
}

async function getGithubUserFromToken(token: string) {
	const user = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}).then((res) => {
		if (!res.ok) {
			throw new Error("Failed to fetch user");
		}

		return res.json();
	});

	return user as {
		id: number;
		login: string;
		avatar_url: string;
	};
}

async function getGithubUserEmailFromToken(token: string) {
	const emails = await fetch("https://api.github.com/user/emails", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}).then((res) => {
		if (!res.ok) {
			throw new Error("Failed to fetch emails");
		}

		return res.json();
	});

	return emails.find((email) => email.primary)?.email as string;
}
