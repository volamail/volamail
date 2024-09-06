import {
	createAsync,
	type RouteDefinition,
	type RouteSectionProps,
} from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { Match, Show, Suspense, Switch } from "solid-js";

import { getTeam } from "~/lib/teams/loaders";
import { Button } from "~/lib/ui/components/button";
import { ExternalLinkIcon } from "lucide-solid";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { getTeamSubcription } from "~/lib/subscriptions/queries";
import { redirectToCustomerPortal } from "~/lib/subscriptions/actions";
import { UpgradeSubscriptionDialog } from "~/lib/subscriptions/components/upgrade-subscription-dialog";

export const route: RouteDefinition = {
	load({ params }) {
		void getTeamSubcription(params.teamId);
	},
};

export default function Usage(props: RouteSectionProps) {
	const subscription = createAsync(() =>
		getTeamSubcription(props.params.teamId),
	);

	const team = createAsync(() => getTeam(props.params.teamId));

	const redirectToCustomerPortalAction = useMutation({
		action: redirectToCustomerPortal,
		onError() {
			showToast({
				title: "Unable to access customer portal",
				variant: "error",
			});
		},
	});

	return (
		<main class="p-8 flex flex-col grow gap-8 max-w-2xl">
			<Title>Usage and Billing - Volamail</Title>

			<div class="flex flex-col gap-2">
				<h1 class="text-3xl font-bold">Usage and Billing</h1>

				<p class="text-gray-600">
					In this page you can monitor your monthly email quota and manage your
					subscription.
				</p>
			</div>

			<section class="flex flex-col gap-2">
				<h2 class="text-2xl font-semibold">Usage</h2>

				<div class="border border-gray-300 bg-gray-50 rounded-lg p-4 flex flex-col gap-4">
					<Suspense
						fallback={
							<div class="flex flex-col gap-2">
								<div class="bg-gray-300 animate-pulse rounded-md h-4 w-full" />

								<div class="bg-gray-200 animate-pulse rounded-md h-3 w-32" />

								<div class="bg-gray-200 animate-pulse rounded-md h-3 w-48 mt-4" />
							</div>
						}
					>
						<div class="flex flex-col gap-1">
							<meter
								value={subscription()?.remainingQuota || 0}
								min={0}
								max={subscription()?.monthlyQuota}
								class="w-full"
								id="usage"
							/>
							<label for="usage" class="text-sm text-gray-500">
								{subscription()?.remainingQuota} of{" "}
								{subscription()?.monthlyQuota} emails remaining
							</label>
						</div>

						<p class="text-sm text-gray-500">
							Refills at:{" "}
							<span class="font-medium text-black">
								{new Date(
									subscription()?.renewsAt || 0 + 1000 * 60 * 60 * 24 * 30,
								).toLocaleString("en-US")}
							</span>
						</p>
					</Suspense>
				</div>
			</section>
			<section class="flex flex-col gap-2">
				<h2 class="text-2xl font-semibold">Subscription</h2>

				<div class="border border-gray-300 bg-gray-50 rounded-lg p-4 flex flex-col items-start gap-3">
					<Suspense
						fallback={
							<div class="flex flex-col gap-2">
								<div class="bg-gray-200 animate-pulse rounded-md h-4 w-48" />
								<div class="bg-gray-300 animate-pulse rounded-md h-8 p-4" />
							</div>
						}
					>
						<div class="flex flex-col">
							<div class="flex gap-1.5 items-center">
								<p class="font-semibold">
									{subscription()?.tier === "CUSTOM"
										? "CUSTOM"
										: subscription()?.tier === "PRO"
											? "PRO"
											: "FREE"}
								</p>
								<div
									class="inline-block rounded-full px-1.5 border text-xs font-medium"
									classList={{
										"bg-green-100 text-green-600 border-green-600":
											subscription()?.status === "ACTIVE",
										"bg-gray-100 text-gray-400 border-gray-300":
											subscription()?.status === "CANCELED",
										"bg-red-100 text-red-600 border-red-600":
											subscription()?.status === "PAST_DUE",
									}}
								>
									{subscription()?.status === "ACTIVE"
										? "Active"
										: subscription()?.status === "CANCELED"
											? "Canceled"
											: "Past due"}
								</div>
							</div>

							<p class="text-2xl font-bold">
								{subscription()?.price}${" "}
								<span class="text-sm font-normal">
									/{subscription()?.periodType === "MONTHLY" ? "month" : "year"}
								</span>
							</p>
						</div>

						<Switch>
							<Match when={subscription()?.tier !== "FREE"}>
								<Show
									when={subscription()?.status !== "CANCELED"}
									fallback={
										<>
											<p class="text-sm text-gray-500">
												This subscription has been canceled and will
												automatically revert to the <strong>Free plan</strong>{" "}
												in 7 days.
											</p>
											<p class="text-sm text-gray-500">
												You can prevent the automatic cancelation by clicking{" "}
												<strong>Manage plan</strong> below.
											</p>
										</>
									}
								>
									<p class="text-sm text-gray-500">
										Renews at:{" "}
										<span class="font-medium text-black">
											{subscription()?.renewsAt.toLocaleString("en-US")}
										</span>
									</p>
								</Show>
								<Show when={subscription()?.status === "PAST_DUE"}>
									<p class="text-sm text-gray-500">
										The last renewal attempt for this subscription failed. It
										will be automatically reverted to the{" "}
										<strong>Free plan</strong> on .
									</p>
								</Show>
							</Match>
						</Switch>

						<div class="flex gap-2 items-center mt-2 justify-end w-full">
							<Show when={subscription()?.tier === "PRO"}>
								<Button
									as="a"
									href="mailto:info@volamail.com"
									variant="outline"
								>
									Upgrade to enterprise
								</Button>
							</Show>
							<Show when={subscription()?.tier === "FREE"}>
								<UpgradeSubscriptionDialog
									team={team()!}
									projectId={props.params.projectId}
									class="mt-2 self-end"
								/>
							</Show>
							<Show when={subscription()?.tier !== "FREE"}>
								<form action={redirectToCustomerPortal} method="post">
									<input
										type="hidden"
										name="teamId"
										value={props.params.teamId}
									/>
									<input
										type="hidden"
										name="projectId"
										value={props.params.projectId}
									/>

									<Button
										type="submit"
										class="self-end"
										icon={() => <ExternalLinkIcon class="size-4" />}
										loading={redirectToCustomerPortalAction.pending}
									>
										Manage plan
									</Button>
								</form>
							</Show>
						</div>
					</Suspense>
				</div>
			</section>
		</main>
	);
}
