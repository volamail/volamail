import { Trash2Icon } from "lucide-solid";

import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTrigger,
	AlertDialogCloseButton,
} from "~/lib/ui/components/alert-dialog";
import { deleteImage } from "../actions";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
	projectId: string;
	id: string;
};

export function DeleteImageDialog(props: Props) {
	const deleteImageMutation = useMutation({
		action: deleteImage,
		onSuccess() {
			showToast({
				title: "Image removed",
				variant: "success",
			});
		},
		onError() {
			showToast({
				title: "Unable to remove image",
				variant: "error",
			});
		},
		filter(params) {
			const formData = params[0];

			return formData.get("id") === props.id;
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger
				as={Button}
				variant="ghost"
				class="p-1"
				even
				icon={() => <Trash2Icon class="size-4" />}
				aria-label="Delete media"
				color="destructive"
			/>
			<AlertDialogContent class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<AlertDialogTitle>Remove image</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to remove this image? Any emails using it will
						no longer display it correctly.
					</AlertDialogDescription>
				</div>

				<form method="post" action={deleteImage} class="flex gap-2 justify-end">
					<input type="hidden" name="projectId" value={props.projectId} />
					<input type="hidden" name="id" value={props.id} />

					<div class="flex gap-2 justify-end">
						<AlertDialogCloseButton as={Button} variant="outline">
							Cancel
						</AlertDialogCloseButton>
						<Button
							type="submit"
							color="destructive"
							class="self-end"
							loading={deleteImageMutation.pending}
							icon={() => <Trash2Icon class="size-4" />}
						>
							Delete file
						</Button>
					</div>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
