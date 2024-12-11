import { deleteSessionCookie } from "./cookies";
import { invalidateAllUserSessions } from "./sessions";

export async function logoutUser(userId: string) {
	await invalidateAllUserSessions(userId);

	deleteSessionCookie();
}
