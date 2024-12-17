import { Button } from "@/modules/ui/components/button";
import {
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
	type ImperativeDialogProps,
} from "@/modules/ui/components/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sendTeamInviteFn } from "../mutations";
import { teamInvitesOptions } from "../queries";

export function ResendTeamInviteDialog(
	props: ImperativeDialogProps<{
		teamId: string;
		email: string;
	}>,
) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: sendTeamInviteFn,
		async onSuccess() {
			await queryClient.invalidateQueries(
				teamInvitesOptions(props.dynamicProps?.teamId),
			);

			toast.success("Invite resent");

			props.onClose();
		},
		onError() {
			toast.error("Failed to resend invite");
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
			<DialogContent title="Resend invite">
				<p className="text-sm dark:text-gray-400">
					Are you sure you want to resend this invite? The user will receive a
					new email with the invite link.
				</p>

				<div className="mt-6 flex justify-end gap-2">
					<DialogCloseTrigger asChild>
						<Button color="neutral">Cancel</Button>
					</DialogCloseTrigger>
					<Button
						loading={mutation.isPending}
						onClick={() => {
							mutation.mutate({
								data: props.dynamicProps!,
							});
						}}
					>
						Send invite
					</Button>
				</div>
			</DialogContent>
		</DialogRoot>
	);
}
