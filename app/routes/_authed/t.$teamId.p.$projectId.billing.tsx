import {
	teamQueryOptions,
	teamUsageOptions,
} from "@/modules/organization/queries";
import { UpgradePlanDialog } from "@/modules/payments/components/upgrade-plan-dialog";
import { createCustomerPortalSession } from "@/modules/payments/mutations/get-customer-portal";
import { ActionButton } from "@/modules/ui/components/action-button";
import { Button } from "@/modules/ui/components/button";
import { DashboardPageHeader } from "@/modules/ui/components/dashboard-page-header";
import { Progress } from "@/modules/ui/components/progress";
import { StickyBanner } from "@/modules/ui/components/sticky-banner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { ExternalLinkIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authed/t/$teamId/p/$projectId/billing")(
	{
		component: RouteComponent,
		async loader({ params, context }) {
			await Promise.all([
				context.queryClient.ensureQueryData(teamQueryOptions(params.teamId)),
				context.queryClient.ensureQueryData(teamUsageOptions(params.teamId)),
			]);
		},
		validateSearch: zodValidator(
			z.object({
				purchase_success: z.boolean().optional(),
			}),
		),
	},
);

function RouteComponent() {
	const params = Route.useParams();
	const searchParams = Route.useSearch();

	const { data: team } = useSuspenseQuery(teamQueryOptions(params.teamId));
	const { data: usage } = useSuspenseQuery(teamUsageOptions(params.teamId));

	const portalMutation = useMutation({
		mutationFn() {
			return createCustomerPortalSession({
				data: {
					teamId: params.teamId,
					projectToRedirectTo: params.projectId,
					stripeCustomerId: team.subscription?.stripeCustomerId!,
				},
			});
		},
		onSuccess(url) {
			window.location.href = url;
		},
		onError() {
			toast.error("Failed to open customer portal");
		},
	});

	return (
		<>
			{searchParams.purchase_success && (
				<StickyBanner>
					<span className="grow dark:text-gray-300">
						Thank you for your purchase. If you don't see the plan yet, please
						refresh the page.
					</span>
					<ActionButton asChild padding="sm" variant="ghost" color="neutral">
						<Link
							to={Route.to}
							params={params}
							search={{ purchase_success: undefined }}
							replace
						>
							<XIcon className="size-4" />
						</Link>
					</ActionButton>
				</StickyBanner>
			)}
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
											? "Our entry plan to get you started with Volamail."
											: team.subscription?.tier === "PRO"
												? "Our premium plan with advanced features."
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
								value={usage.emails.used}
								min={0}
								max={usage.emails.max}
								valueText={`${usage.emails.used} of ${usage.emails.max} emails sent`}
							/>

							{team.subscription?.tier === "FREE" ? (
								<UpgradePlanDialog
									teamId={params.teamId}
									projectId={params.projectId}
								/>
							) : (
								<div className="flex gap-4 self-end">
									{team.subscription?.tier === "PRO" && (
										<Button asChild color="neutral">
											<a href="mailto:info@volamail.com">
												Request a custom plan
											</a>
										</Button>
									)}
									<Button
										onClick={() => portalMutation.mutate()}
										loading={portalMutation.isPending}
										trailing={<ExternalLinkIcon className="size-4" />}
									>
										Manage subscription
									</Button>
								</div>
							)}
						</div>
					</section>
				</div>
			</div>
		</>
	);
}
