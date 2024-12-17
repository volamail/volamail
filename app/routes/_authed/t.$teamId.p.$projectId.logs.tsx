import { projectLogsOptions } from "@/modules/sending/queries";
import { ActionButton } from "@/modules/ui/components/action-button";
import { Badge } from "@/modules/ui/components/badge";
import { DashboardPageHeader } from "@/modules/ui/components/dashboard-page-header";
import { EmptyState } from "@/modules/ui/components/empty-state";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeadCell,
	TableRow,
} from "@/modules/ui/components/table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/_authed/t/$teamId/p/$projectId/logs")({
	component: RouteComponent,
	validateSearch: zodValidator(
		z.object({
			page: z.number().int().min(1).optional().default(1),
		}),
	),
	loaderDeps({ search }) {
		return {
			page: search.page,
		};
	},
	async loader({ params, context, deps }) {
		await context.queryClient.ensureQueryData(
			projectLogsOptions({
				teamId: params.teamId,
				projectId: params.projectId,
				page: deps.page,
			}),
		);
	},
});

function RouteComponent() {
	const params = Route.useParams();
	const search = Route.useSearch();

	const { data: logs } = useSuspenseQuery(
		projectLogsOptions({
			teamId: params.teamId,
			projectId: params.projectId,
			page: search.page,
		}),
	);

	return (
		<div className="grow px-8 py-16">
			<div className="mx-auto flex max-w-3xl flex-col gap-8">
				<DashboardPageHeader
					title="Logs"
					description="List of emails sent from this project."
				/>

				<div className="flex flex-col gap-3">
					{logs.rows.length > 0 ? (
						<>
							<Table>
								<TableHead>
									<TableRow>
										<TableHeadCell>Status</TableHeadCell>
										<TableHeadCell>From</TableHeadCell>
										<TableHeadCell>To</TableHeadCell>
										<TableHeadCell>Subject</TableHeadCell>
										<TableHeadCell>Sent</TableHeadCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{logs.rows.map((log) => (
										<TableRow key={log.id} className="odd:bg-gray-800/50">
											<TableCell>
												<Badge
													color={
														log.status === "SENT"
															? "neutral"
															: log.status === "DELIVERED"
																? "green"
																: "red"
													}
												>
													{log.status}
												</Badge>
											</TableCell>
											<TableCell>{log.from}</TableCell>
											<TableCell>{log.to}</TableCell>
											<TableCell className="truncate">{log.subject}</TableCell>
											<TableCell>
												{formatDistanceToNow(new Date(log.sentAt), {
													addSuffix: true,
												})}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<div className="flex items-center justify-between">
								<span className="text-sm dark:text-gray-500">
									Showing {logs.rows.length} of {logs.total} logs
								</span>

								<div className="flex gap-2">
									<ActionButton
										asChild
										padding="sm"
										color="neutral"
										disabled={search.page <= 1}
									>
										<Link
											to={Route.to}
											params={params}
											search={{ page: search.page - 1 }}
											disabled={search.page <= 1}
										>
											<ChevronLeftIcon className="size-4" />
										</Link>
									</ActionButton>

									<ActionButton
										asChild
										padding="sm"
										color="neutral"
										disabled={search.page === logs.pages}
									>
										<Link
											to={Route.to}
											params={params}
											search={{ page: search.page + 1 }}
											disabled={search.page === logs.pages}
										>
											<ChevronRightIcon className="size-4" />
										</Link>
									</ActionButton>
								</div>
							</div>
						</>
					) : (
						<EmptyState
							title="You haven't sent any emails yet."
							description="Use the API to send emails and they will appear here."
						/>
					)}
				</div>
			</div>
		</div>
	);
}
