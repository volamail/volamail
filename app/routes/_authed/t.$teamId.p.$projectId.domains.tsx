import { teamQueryOptions } from "@/modules/organization/queries";
import { DeleteDomainDialog } from "@/modules/sending/identities/components/delete-domain-dialog";
import { RegisterDomainDialog } from "@/modules/sending/identities/components/register-domain-dialog";
import { projectDomainsOptions } from "@/modules/sending/identities/queries";
import { Badge } from "@/modules/ui/components/badge";
import { Button } from "@/modules/ui/components/button";
import { DashboardPageHeader } from "@/modules/ui/components/dashboard-page-header";
import { EmptyState } from "@/modules/ui/components/empty-state";
import { Tooltip } from "@/modules/ui/components/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { LoaderIcon } from "lucide-react";

export const Route = createFileRoute("/_authed/t/$teamId/p/$projectId/domains")(
	{
		component: RouteComponent,
		async loader({ params, context }) {
			await Promise.all([
				context.queryClient.ensureQueryData(teamQueryOptions(params.teamId)),
				context.queryClient.ensureQueryData(
					projectDomainsOptions(params.teamId, params.projectId),
				),
			]);
		},
	},
);

function RouteComponent() {
	const params = Route.useParams();

	const { data: domains } = useSuspenseQuery(
		projectDomainsOptions(params.teamId, params.projectId),
	);

	const { data: team } = useSuspenseQuery(teamQueryOptions(params.teamId));

	return (
		<div className="flex h-full flex-col items-center justify-start px-8 py-16">
			<div className="flex w-full max-w-3xl flex-col gap-8">
				<DashboardPageHeader
					title="Domains"
					description="Manage the domains registered for this project"
					trailing={
						domains.length > 0 &&
						(domains.length < team.subscription!.maxDomains ? (
							<RegisterDomainDialog
								teamId={params.teamId}
								projectId={params.projectId}
								trigger={<Button>Register domain</Button>}
							/>
						) : (
							<Tooltip
								content={
									<>
										Maximum number of domains reached for this project. Go to
										the{" "}
										<Link href="/billing" className="dark:text-primary-400">
											Billing
										</Link>{" "}
										page to upgrade your team's plan.
									</>
								}
							>
								<Button disabled>Register domain</Button>
							</Tooltip>
						))
					}
				/>

				{domains.length > 0 ? (
					<ul className="flex flex-col gap-4 w-full">
						{domains.map((domain) => (
							<li
								key={domain.id}
								className="relative w-full flex items-center gap-4 border dark:border-gray-700 dark:bg-gray-900 rounded-xl p-6"
							>
								<DeleteDomainDialog
									teamId={params.teamId}
									projectId={params.projectId}
									domainId={domain.id}
								/>
								<div className="flex flex-col gap-6 w-full">
									<div className="font-bold dark:text-gray-50 text-xl inline-flex items-center gap-4">
										<p>{domain.domain}</p>
									</div>

									<div className="grid grid-cols-2 gap-2 items-center justify-items-start self-start">
										<span className="dark:text-gray-400 text-sm">Status:</span>
										<Badge color={domain.verified ? "green" : "yellow"}>
											{domain.verified ? (
												"Verified"
											) : (
												<>
													Verifying
													<LoaderIcon className="size-3 animate-spin" />
												</>
											)}
										</Badge>
										<span className="dark:text-gray-400 text-sm">
											Added at:
										</span>
										<p className="dark:text-gray-50 text-sm">
											{new Date(domain.createdAt).toLocaleString("en-US")}
										</p>
									</div>

									<div className="flex flex-col w-full mt-2 gap-1">
										<h3 className="font-medium dark:text-gray-50">
											DNS entries
										</h3>
										{!domain.verified && (
											<p className="dark:text-gray-400 text-sm">
												To verify your domain, add the following DNS records to
												your domain's DNS settings.
											</p>
										)}
										<table className="text-xs">
											<thead className="border-b dark:border-gray-700">
												<tr>
													<th className="font-medium dark:text-gray-400 py-3">
														Type
													</th>
													<th className="font-medium dark:text-gray-400 py-3">
														Name
													</th>
													<th className="font-medium dark:text-gray-400 py-3">
														Value
													</th>
												</tr>
											</thead>
											<tbody>
												{domain.tokens.map((token) => (
													<tr
														key={token}
														className="border-b dark:border-gray-800 font-mono text-[0.7rem]"
													>
														<td className="py-3 pr-4">CNAME</td>
														<td className="py-3 pr-4">{`${token}._domainkey.`}</td>
														<td className="py-3 pr-4">{`${token}.dkim.amazonses.com`}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</li>
						))}
					</ul>
				) : (
					<EmptyState
						title="Add your first domain"
						description="Register a domain to start sending emails with your own email addresses"
					>
						<RegisterDomainDialog
							teamId={params.teamId}
							projectId={params.projectId}
							trigger={<Button>Register domain</Button>}
						/>
					</EmptyState>
				)}
			</div>
		</div>
	);
}
