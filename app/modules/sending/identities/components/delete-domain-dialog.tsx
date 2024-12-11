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
import { deleteProjectDomainFn } from "../mutations";
import { projectDomainsOptions } from "../queries";

interface Props {
	teamId: string;
	projectId: string;
	domainId: string;
}

export function DeleteDomainDialog(props: Props) {
	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: deleteProjectDomainFn,
		async onSuccess() {
			setOpen(false);

			toast.success("Domain deleted successfully.");

			await queryClient.invalidateQueries(
				projectDomainsOptions(props.teamId, props.projectId),
			);
		},
		onError() {
			toast.error("Failed to delete domain.");
		},
	});

	return (
		<DialogRoot
			role="alertdialog"
			open={open}
			onOpenChange={({ open }) => setOpen(open)}
		>
			<DialogTrigger asChild>
				<ActionButton
					variant="ghost"
					color="neutral"
					className="absolute right-4 top-4"
					padding="sm"
				>
					<XIcon className="size-4" />
				</ActionButton>
			</DialogTrigger>
			<DialogContent title="Delete domain">
				<p className="text-sm dark:text-gray-400">
					Are you sure you want to delete this domain? You'll have to verify it
					again if you want to use it in the future.
				</p>

				<div className="flex justify-end gap-2 mt-8">
					<DialogCloseTrigger asChild>
						<Button color="neutral">Cancel</Button>
					</DialogCloseTrigger>
					<Button
						color="red"
						trailing={<XIcon className="size-4" />}
						loading={mutation.isPending}
						onClick={() =>
							mutation.mutate({
								teamId: props.teamId,
								projectId: props.projectId,
								domainId: props.domainId,
							})
						}
					>
						Delete
					</Button>
				</div>
			</DialogContent>
		</DialogRoot>
	);
}
