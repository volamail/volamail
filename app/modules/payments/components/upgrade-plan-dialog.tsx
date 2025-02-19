import { Button } from "@/modules/ui/components/button";
import {
	DialogContent,
	DialogRoot,
	DialogTrigger,
} from "@/modules/ui/components/dialog";
import { useMutation } from "@tanstack/react-query";
import { ExternalLinkIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { SUBSCRIPTION_QUOTAS } from "../constants";
import { createProPlanCheckout } from "../mutations/get-pro-plan-checkout";

interface Props {
	teamId: string;
	projectId: string;
}

export function UpgradePlanDialog(props: Props) {
	const mutation = useMutation({
		mutationFn() {
			return createProPlanCheckout({
				data: {
					teamId: props.teamId,
					projectToRedirectTo: props.projectId,
				},
			});
		},
		onSuccess(url) {
			window.location.href = url;
		},
		onError() {
			toast.error("Failed to create checkout session");
		},
	});

	return (
		<DialogRoot>
			<DialogTrigger asChild>
				<Button className="self-end">Upgrade plan</Button>
			</DialogTrigger>
			<DialogContent title="Upgrade plan" className="max-w-lg">
				<p className="text-sm dark:text-gray-500">
					Choose a plan that suits your team's needs.
				</p>

				<div className="mt-4 flex flex-col gap-4">
					<div className="flex flex-col gap-4 rounded-lg border p-6 dark:border-primary-900 dark:bg-gradient-to-br dark:from-primary-950/10 dark:via-primary-500/20 dark:to-primary-900/20">
						<div className="flex grow flex-col">
							<h3 className="font-medium text-lg">Pro</h3>
							<p className="text-sm dark:text-gray-400">
								Our pro plan is perfect for teams using Volamail in production.
								It includes{" "}
								<strong className="font-medium dark:text-gray-100">
									{SUBSCRIPTION_QUOTAS.PRO.emails} emails
								</strong>{" "}
								per month and{" "}
								<strong className="font-medium dark:text-gray-100">
									{SUBSCRIPTION_QUOTAS.PRO.projects} projects
								</strong>{" "}
								per team.
							</p>
						</div>
						<Button
							trailing={<ExternalLinkIcon className="size-4" />}
							className="mt-4 self-end"
							onClick={() => mutation.mutate()}
							loading={mutation.isPending}
						>
							Upgrade to Pro
						</Button>
					</div>

					<div className="flex flex-col gap-4 rounded-lg border p-6 dark:border-gray-700 dark:bg-gray-900">
						<div className="flex grow flex-col">
							<h3 className="font-medium text-lg">Custom</h3>
							<p className="text-sm dark:text-gray-400">
								A customized plan to suit your needs. Contact us for more
								information.
							</p>
						</div>

						<Button
							asChild
							color="neutral"
							className="mt-4 self-end"
							trailing={<SendIcon className="size-4" />}
						>
							<a href="mailto:info@volamail.com">Contact us</a>
						</Button>
					</div>
				</div>
			</DialogContent>
		</DialogRoot>
	);
}
