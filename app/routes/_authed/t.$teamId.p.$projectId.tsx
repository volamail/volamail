import { userTeamsOptions } from "@/modules/organization/queries";
import { Sidebar } from "@/modules/ui/components/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/t/$teamId/p/$projectId")({
	component: RouteComponent,
	async loader({ context }) {
		await context.queryClient.ensureQueryData(userTeamsOptions());
	},
});

function RouteComponent() {
	const params = Route.useParams();

	const { data: teams } = useSuspenseQuery(userTeamsOptions());

	return (
		<div className="relative z-0 flex min-h-dvh">
			<Sidebar teams={teams} current={params} />

			<div className="grow bg-gradient-to-br dark:from-gray-900 dark:to-gray-900/10">
				<Outlet />
			</div>
		</div>
	);
}
