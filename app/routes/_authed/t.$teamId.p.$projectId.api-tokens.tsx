import { CreateApiTokenDialog } from "@/modules/api-tokens/components/create-api-token-dialog";
import { RevokeApiTokenDialog } from "@/modules/api-tokens/components/revoke-api-token-dialog";
import { projectApiTokensQueryOptions } from "@/modules/api-tokens/queries";
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
import { createFileRoute } from "@tanstack/react-router";
import { MoreVerticalIcon } from "lucide-react";

export const Route = createFileRoute(
	"/_authed/t/$teamId/p/$projectId/api-tokens",
)({
	component: RouteComponent,
	async loader({ context, params }) {
		await context.queryClient.ensureQueryData(
			projectApiTokensQueryOptions(params.teamId, params.projectId),
		);
	},
});

function RouteComponent() {
	const params = Route.useParams();

	const { data: tokens } = useSuspenseQuery(
		projectApiTokensQueryOptions(params.teamId, params.projectId),
	);

	return (
		<div className="flex h-full flex-col items-center justify-start px-8 py-16">
			<div className="flex w-full max-w-3xl flex-col gap-8">
				<DashboardPageHeader
					title="API Tokens"
					description="Create and manage this project's API tokens"
					trailing={
						tokens.length > 0 ? (
							<CreateApiTokenDialog
								teamId={params.teamId}
								projectId={params.projectId}
							/>
						) : null
					}
				/>

				{tokens.length > 0 ? (
					<Table>
						<TableHead>
							<TableRow>
								<TableHeadCell>Token</TableHeadCell>
								<TableHeadCell>Status</TableHeadCell>
								<TableHeadCell>Created</TableHeadCell>
								<TableHeadCell>Revoked</TableHeadCell>
								<TableHeadCell />
							</TableRow>
						</TableHead>
						<TableBody>
							{tokens.map((token) => (
								<TableRow key={token.id} className="odd:bg-gray-800/50">
									<TableCell>
										<div className="flex flex-col gap-0.5">
											<span>{token.description}</span>
											<span className="font-mono text-xs dark:text-gray-400">
												{token.token}
											</span>
										</div>
									</TableCell>

									<TableCell>
										<Badge color={token.revokedAt ? "red" : "green"}>
											{token.revokedAt ? "Revoked" : "Active"}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(token.createdAt).toLocaleString("en-US", {
											dateStyle: "short",
											timeStyle: "short",
										})}
									</TableCell>
									<TableCell>
										{token.revokedAt
											? new Date(token.revokedAt).toLocaleString("en-US", {
													dateStyle: "short",
													timeStyle: "short",
												})
											: "-"}
									</TableCell>
									<TableCell className="px-2 text-center">
										{!token.revokedAt ? (
											<RevokeApiTokenDialog
												teamId={params.teamId}
												projectId={params.projectId}
												tokenId={token.id}
											/>
										) : (
											<div className="size-6" />
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<EmptyState
						title="Generate an API token"
						description="This project doesn't have any API tokens yet."
					>
						<CreateApiTokenDialog
							teamId={params.teamId}
							projectId={params.projectId}
						/>
					</EmptyState>
				)}
			</div>
		</div>
	);
}
