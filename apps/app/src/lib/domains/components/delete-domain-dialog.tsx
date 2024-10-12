import { Trash2Icon } from "lucide-solid";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "~/lib/ui/components/alert-dialog";
import { deleteDomain } from "../actions";
import { Button } from "~/lib/ui/components/button";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { showToast } from "~/lib/ui/components/toasts";

type Props = {
	projectId: string;
	domainId?: string;
	onClose: () => void;
};

export function DeleteDomainDialog(props: Props) {
	const deleteDomainMutation = useMutation({
		action: deleteDomain,
		onSuccess() {
			showToast({
				title: "Domain deleted",
				variant: "success",
			});

			props.onClose();
		},
		onError(e) {
			console.log(e);
			showToast({
				title: "Unable to delete domain",
				variant: "error",
			});
		},
	});

	return (
		<AlertDialog
			open={props.domainId !== undefined}
			onOpenChange={props.onClose}
		>
			<AlertDialogContent class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<AlertDialogTitle>Delete domain</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete this domain?
					</AlertDialogDescription>
				</div>

				<form
					method="post"
					action={deleteDomain}
					class="flex gap-2 justify-end"
				>
					<input type="hidden" name="projectId" value={props.projectId} />

					<input type="hidden" name="domainId" value={props.domainId} />

					<Button
						type="button"
						variant="outline"
						class="self-end"
						onClick={props.onClose}
					>
						Cancel
					</Button>

					<Button
						type="submit"
						color="destructive"
						class="self-end"
						icon={() => <Trash2Icon class="size-4" />}
						loading={deleteDomainMutation.pending}
					>
						Delete
					</Button>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
