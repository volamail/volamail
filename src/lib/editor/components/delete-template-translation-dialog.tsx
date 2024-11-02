import { XIcon } from "lucide-solid";
import { createSignal } from "solid-js";
import { deleteTemplateTranslation } from "~/lib/templates/actions";
import type { TemplateLanguage } from "~/lib/templates/languages";
import {
	AlertDialog,
	AlertDialogCloseButton,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/lib/ui/components/alert-dialog";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

interface DeleteTemplateTranlationDialogProps {
	projectId: string;
	slug: string;
	language: TemplateLanguage;
}

export function DeleteTemplateTranlationDialog(
	props: DeleteTemplateTranlationDialogProps,
) {
	const [open, setOpen] = createSignal(false);

	const deleteTemplateTranslationAction = useMutation({
		action: deleteTemplateTranslation,
		onSuccess() {
			showToast({
				title: "Translation deleted",
				variant: "success",
			});

			setOpen(false);
		},
		onError() {
			showToast({
				title: "Unable to delete translation",
				variant: "error",
			});
		},
	});

	return (
		<AlertDialog open={open()} onOpenChange={setOpen}>
			<AlertDialogTrigger as={Button} variant="ghost" even class="p-0.5">
				<XIcon class="size-4" />
				<span class="sr-only">Delete translation</span>
			</AlertDialogTrigger>
			<AlertDialogContent
				as="form"
				method="post"
				action={deleteTemplateTranslation}
				class="flex flex-col gap-4"
			>
				<input type="hidden" name="projectId" value={props.projectId} />
				<input type="hidden" name="slug" value={props.slug} />
				<input type="hidden" name="language" value={props.language} />

				<div class="flex flex-col gap-2">
					<AlertDialogTitle>Delete translation</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete this translation?
					</AlertDialogDescription>
				</div>

				<div class="flex gap-2 justify-end">
					<AlertDialogCloseButton as={Button} variant="outline">
						Cancel
					</AlertDialogCloseButton>
					<Button
						type="submit"
						color="destructive"
						icon={() => <XIcon class="size-4" />}
						loading={deleteTemplateTranslationAction.pending}
					>
						Delete
					</Button>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
