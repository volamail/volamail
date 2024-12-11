import { authenticationMiddleware } from "@/modules/rpcs/server-functions";
import { createServerFn } from "@tanstack/start";
import { logoutUser } from "../logout";

export const logoutUserFn = createServerFn({ method: "POST" })
	.middleware([authenticationMiddleware])
	.handler(async ({ context }) => {
		const { user } = context;

		await logoutUser(user.id);
	});
