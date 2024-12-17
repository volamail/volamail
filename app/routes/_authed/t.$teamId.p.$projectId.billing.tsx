import { teamQueryOptions } from "@/modules/organization/queries";
import { Button } from "@/modules/ui/components/button";
import { DashboardPageHeader } from "@/modules/ui/components/dashboard-page-header";
import { Progress } from "@/modules/ui/components/progress";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";

export const Route = createFileRoute("/_authed/t/$teamId/p/$projectId/billing")(
	{
		component: RouteComponent,
		async loader({ params, context }) {
			await context.queryClient.ensureQueryData(
				teamQueryOptions(params.teamId),
			);
		},
	},
);

function RouteComponent() {
	const params = Route.useParams();

	const { data: team } = useSuspenseQuery(teamQueryOptions(params.teamId));

	return (
		<div className="flex h-full flex-col items-center justify-start px-8 py-16">
			<div className="flex w-full max-w-3xl flex-col gap-8">
				<DashboardPageHeader
					title="Billing"
					description="Manage your team's billing information and subscription"
				/>

				<section className="flex flex-col rounded-xl border dark:border-gray-700 dark:bg-gray-900">
					<div className="flex flex-col gap-8 p-8">
						<div className="flex items-start justify-between gap-4">
							<div className="flex flex-col gap-1">
								<h3 className="font-medium text-lg">
									{team.subscription?.tier === "FREE" ? "Free" : "Pro"} plan
								</h3>
								<p className="text-sm dark:text-gray-400">
									{team.subscription?.tier === "FREE"
										? "Our free plan offers 500 emails per month, 20MB of image storage, 2 projects and 1 domain per project."
										: team.subscription?.tier === "PRO"
											? "Our pro plan offers 1000 emails per month, 5 projects and 3 domains per project."
											: "Customized plan"}
								</p>
							</div>

							<span className="shrink-0 font-medium text-3xl">
								${team.subscription?.price}{" "}
								<span className="font-normal text-sm">
									{team.subscription?.periodType === "MONTHLY"
										? "per month"
										: "per year"}
								</span>
							</span>
						</div>

						<Progress
							label="Emails"
							trend="positive"
							value={
								team.subscription!.monthlyQuota -
								team.subscription!.remainingQuota
							}
							min={0}
							max={team.subscription?.monthlyQuota}
							valueText={`${team.subscription!.monthlyQuota - team.subscription!.remainingQuota} of ${team.subscription?.monthlyQuota} emails sent`}
						/>

						<Progress
							label="Projects"
							trend="positive"
							value={team.projects.length}
							min={0}
							max={team.subscription!.maxProjects}
							valueText={`${team.projects.length} of ${team.subscription?.maxProjects} projects used`}
						/>

						<Button
							trailing={<ExternalLinkIcon className="size-4" />}
							className="self-end"
						>
							Upgrade
						</Button>
					</div>
				</section>
			</div>
		</div>
	);
}
