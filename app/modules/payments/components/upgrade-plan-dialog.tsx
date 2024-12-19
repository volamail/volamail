import { Button } from "@/modules/ui/components/button";
import {
	DialogContent,
	DialogRoot,
	DialogTrigger,
} from "@/modules/ui/components/dialog";
import { ExternalLinkIcon } from "lucide-react";
import { SUBSCRIPTION_QUOTAS } from "../constants";

export function UpgradePlanDialog() {
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
					<div className="flex flex-col gap-4 rounded-lg border p-4 dark:border-gray-700 dark:bg-gradient-to-br dark:from-gray-900 dark:to-primary-900/10">
						<div className="flex grow flex-col">
							<h3 className="font-medium text-lg">Pro</h3>
							<p className="text-sm dark:text-gray-500">
								Our pro plan includes{" "}
								<strong className="font-medium dark:text-gray-400">
									{SUBSCRIPTION_QUOTAS.PRO.emails} emails
								</strong>{" "}
								per month and{" "}
								<strong className="font-medium dark:text-gray-400">
									{SUBSCRIPTION_QUOTAS.PRO.projects} projects
								</strong>{" "}
								per team.
							</p>
						</div>
						<Button
							trailing={<ExternalLinkIcon className="size-4" />}
							className="self-end"
						>
							Upgrade to Pro
						</Button>
					</div>

					<div className="flex flex-col gap-4 rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-900">
						<div className="flex grow flex-col">
							<h3 className="font-medium text-lg">Custom</h3>
							<p className="text-sm dark:text-gray-500">
								A customized plan to suit your needs. Contact us for more
								information.
							</p>
						</div>

						<Button asChild color="neutral" className="self-end">
							<a href="mailto:info@volamail.com">Contact us</a>
						</Button>
					</div>
				</div>
			</DialogContent>
		</DialogRoot>
	);
}
