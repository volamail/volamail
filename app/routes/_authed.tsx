import { currentUserQueryOptions } from "@/modules/auth/queries";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
	async beforeLoad({ context, location }) {
		const user = await context.queryClient.ensureQueryData(
			currentUserQueryOptions(),
		);

		if (!user) {
			return redirect({
				to: "/login",
				search: {
					next: location.pathname !== "/" ? location.pathname : undefined,
				},
			});
		}

		return { user };
	},
});
