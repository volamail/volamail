import { ActionButton } from "@/modules/ui/components/action-button";
import { Button } from "@/modules/ui/components/button";
import {
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
	DialogTrigger,
} from "@/modules/ui/components/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { revokeApiTokenFn } from "../mutations";
import { projectApiTokensQueryOptions } from "../queries";

interface Props {
	teamId: string;
	projectId: string;
	tokenId: string;
}

export function RevokeApiTokenDialog(props: Props) {
	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: revokeApiTokenFn,
		async onSuccess() {
			await queryClient.invalidateQueries({
				queryKey: projectApiTokensQueryOptions(props.teamId, props.projectId)
					.queryKey,
			});

			toast.success("Token revoked successfully");

			setOpen(false);
		},
	});

	return (
		<DialogRoot open={open} onOpenChange={({ open }) => setOpen(open)}>
			<DialogTrigger asChild>
				<ActionButton
					aria-label="Revoke token"
					color="neutral"
					variant="ghost"
					padding="sm"
				>
					<XIcon className="size-4" />
				</ActionButton>
			</DialogTrigger>
			<DialogContent title="Revoke API token">
				<p className="text-sm dark:text-gray-400">
					Are you sure you want to revoke this API token? Your existing code
					that is using this token will stop working.
				</p>

				<p className="text-sm dark:text-gray-400">
					This action cannot be undone.
				</p>

				<div className="mt-6 flex items-center justify-end gap-2">
					<DialogCloseTrigger asChild>
						<Button color="neutral">Cancel</Button>
					</DialogCloseTrigger>
					<Button
						color="red"
						loading={mutation.isPending}
						onClick={() =>
							mutation.mutate({
								teamId: props.teamId,
								projectId: props.projectId,
								tokenId: props.tokenId,
							})
						}
					>
						Revoke token
					</Button>
				</div>
			</DialogContent>
		</DialogRoot>
	);
}
