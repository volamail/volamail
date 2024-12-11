import { deleteCookie, getCookie, setCookie } from "vinxi/http";

const AUTH_COOKIE_NAME = "auth_session";

export function getSessionCookie() {
	return getCookie(AUTH_COOKIE_NAME);
}

export function setSessionCookie(token: string, expiresAt: Date) {
	setCookie(AUTH_COOKIE_NAME, token, {
		secure: import.meta.env.PROD,
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		expires: expiresAt,
	});
}

export function deleteSessionCookie() {
	deleteCookie(AUTH_COOKIE_NAME);
}
