import { Trash2Icon } from "lucide-solid";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "~/lib/ui/components/alert-dialog";
import { deleteTemplate } from "../actions";
import { Button } from "~/lib/ui/components/button";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { showToast } from "~/lib/ui/components/toasts";

type Props = {
	projectId: string;
	templateId: string;
	open: boolean;
	onClose: () => void;
};

export function DeleteTemplateDialog(props: Props) {
	const deleteTemplateMutation = useMutation({
		action: deleteTemplate,
		onSuccess() {
			showToast({
				title: "Email deleted",
				variant: "success",
			});

			props.onClose();
		},
		onError(e) {
			showToast({
				title: "Unable to delete email",
				variant: "error",
			});
		},
	});

	return (
		<AlertDialog open={props.open} onOpenChange={props.onClose}>
			<AlertDialogContent class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<AlertDialogTitle>Delete email</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete this email?
					</AlertDialogDescription>
				</div>

				<form
					method="post"
					action={deleteTemplate}
					class="flex gap-2 justify-end"
				>
					<input type="hidden" name="projectId" value={props.projectId} />

					<input type="hidden" name="id" value={props.templateId} />

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
						loading={deleteTemplateMutation.pending}
					>
						Delete
					</Button>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
