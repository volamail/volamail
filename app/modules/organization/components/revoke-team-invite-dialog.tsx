import { Button } from "@/modules/ui/components/button";
import {
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
	type ImperativeDialogProps,
} from "@/modules/ui/components/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { revokeTeamInviteFn } from "../mutations";
import { teamInvitesOptions } from "../queries";

export function RevokeTeamInviteDialog(
	props: ImperativeDialogProps<{
		teamId: string;
		email: string;
	}>,
) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: revokeTeamInviteFn,
		async onSuccess() {
			await queryClient.invalidateQueries(
				teamInvitesOptions(props.dynamicProps?.teamId),
			);

			toast.success("Invite revoked");

			props.onClose();
		},
		onError() {
			toast.error("Failed to revoke invite");
		},
	});

	return (
		<DialogRoot
			role="alertdialog"
			open={props.dynamicProps !== null}
			onOpenChange={({ open }) => {
				if (!open) {
					props.onClose();
				}
			}}
		>
			<DialogContent title="Revoke invite">
				<p className="text-sm dark:text-gray-400">
					Are you sure you want to revoke this invite?
				</p>

				<p className="text-sm dark:text-gray-400">
					The user won't be able to accept it anymore. You'll have to re-invite
					them if you want them to join your team.
				</p>

				<div className="mt-6 flex justify-end gap-2">
					<DialogCloseTrigger asChild>
						<Button color="neutral">Cancel</Button>
					</DialogCloseTrigger>
					<Button
						color="red"
						loading={mutation.isPending}
						onClick={() =>
							mutation.mutate({
								teamId: props.dynamicProps?.teamId,
								email: props.dynamicProps?.email,
							})
						}
					>
						Revoke invite
					</Button>
				</div>
			</DialogContent>
		</DialogRoot>
	);
}
