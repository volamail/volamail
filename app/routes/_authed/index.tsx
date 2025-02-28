import { currentUserQueryOptions } from "@/modules/auth/queries";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/")({
	async beforeLoad({ context }) {
		const user = await context.queryClient.ensureQueryData(
			currentUserQueryOptions(),
		);

		if (!user) {
			return redirect({
				to: "/login",
			});
		}

		return redirect({
			to: "/t/$teamId/p/$projectId/templates",
			params: {
				teamId: user.defaultProject.teamId,
				projectId: user.defaultProject.id,
			},
		});
	},
	component: function AuthFallbackRoute() {
		return null;
	},
});
