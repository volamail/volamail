import { clientEnv } from "@/modules/environment/client";
import { teamInviteOptions } from "@/modules/organization/queries";
import { acceptTeamInviteFn } from "@/modules/templates/mutations";
import { Button } from "@/modules/ui/components/button";
import { GridBgContainer } from "@/modules/ui/components/grid-bg-container";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRightIcon, HeadsetIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/join-team/$inviteCode")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();

	const { data: inviteResult } = useSuspenseQuery(
		teamInviteOptions(params.inviteCode),
	);

	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: acceptTeamInviteFn,
		async onSuccess(data) {
			toast.info("Invite accepted, you're being redirected...");

			await navigate({
				to: "/t/$teamId/p/$projectId/templates",
				params: {
					teamId: data.teamId,
					projectId: data.projectId,
				},
			});
		},
	});

	return (
		<GridBgContainer className="flex h-dvh flex-col items-center justify-center bg-grid-small-black/10 dark:bg-grid-small-white/10">
			<main className="z-10 flex w-full max-w-sm flex-col gap-6 rounded-lg border border-gray-300 bg-gradient-to-br p-12 shadow-2xl dark:border-gray-700 dark:from-gray-900 dark:to-gray-950">
				{inviteResult.success ? (
					<>
						<div className="flex flex-col gap-2">
							<h1 className="font-semibold text-2xl">Join team</h1>
							<p className="text-gray-600 text-sm dark:text-gray-400">
								You've been invited to join <b>{inviteResult.data.team.name}</b>
								.
							</p>
							<p className="text-gray-600 text-sm dark:text-gray-400">
								Click the following button to accept the invitation and start
								collaborating with them.
							</p>
						</div>

						<Button
							padding="lg"
							type="submit"
							trailing={<ChevronRightIcon className="size-4" />}
							onClick={() =>
								mutation.mutate({
									data: {
										code: inviteResult.data.code,
									},
								})
							}
							loading={mutation.isPending}
						>
							Join {inviteResult.data.team.name}
						</Button>
					</>
				) : inviteResult.error === "EXPIRED" ? (
					<div className="flex flex-col gap-2 text-center">
						<h1 className="font-semibold text-2xl">Invitation expired</h1>
						<p className="text-gray-600 text-sm dark:text-gray-400">
							This invitation has expired. Ask the team owner to send you a new
							invitation.
						</p>

						<Button
							asChild
							color="neutral"
							padding="lg"
							className="mt-6"
							trailing={<HeadsetIcon className="size-4" />}
						>
							<a href={`mailto:${clientEnv.VITE_SUPPORT_EMAIL}`}>
								Contact support
							</a>
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-2 text-center">
						<h1 className="font-semibold text-2xl">Invalid invitation</h1>
						<p className="text-gray-600 text-sm dark:text-gray-400">
							The invitation is invalid. It's either expired, revoked by a team
							member, or already accepted.
						</p>

						<Button
							asChild
							color="neutral"
							padding="lg"
							className="mt-6"
							trailing={<HeadsetIcon className="size-4" />}
						>
							<a href={`mailto:${clientEnv.VITE_SUPPORT_EMAIL}`}>
								Contact support
							</a>
						</Button>
					</div>
				)}
			</main>
		</GridBgContainer>
	);
}
