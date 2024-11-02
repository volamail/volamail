import { type H3Event, deleteCookie, getCookie, setCookie } from "vinxi/http";

const AUTH_COOKIE_NAME = "auth_session";

export function getSessionCookie(event: H3Event) {
	return getCookie(event, AUTH_COOKIE_NAME);
}

export function setSessionCookie(
	event: H3Event,
	token: string,
	expiresAt: Date,
) {
	setCookie(event, AUTH_COOKIE_NAME, token, {
		secure: import.meta.env.PROD,
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		expires: expiresAt,
	});
}

export function deleteSessionCookie(event: H3Event) {
	deleteCookie(event, AUTH_COOKIE_NAME);
}
