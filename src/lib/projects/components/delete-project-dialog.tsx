import { Trash2Icon } from "lucide-solid";
import { createMemo, createSignal } from "solid-js";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/lib/ui/components/alert-dialog";
import { deleteProject } from "../actions";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
	projectId: string;
};

const CONFIRM_TEXT = "delete me";

export function DeleteProjectDialog(props: Props) {
	const [open, setOpen] = createSignal(false);

	const [confirmText, setConfirmText] = createSignal("");

	const disabled = createMemo(
		() => confirmText().toLowerCase() !== CONFIRM_TEXT.toLowerCase(),
	);

	const deleteProjectMutation = useMutation({
		action: deleteProject,
		onSuccess() {
			showToast({
				title: "Project deleted",
				variant: "success",
			});

			setOpen(false);
		},
		onError(e) {
			console.log(e);
			showToast({
				title: "Unable to delete project",
				variant: "error",
			});
		},
	});

	return (
		<AlertDialog open={open()} onOpenChange={setOpen}>
			<AlertDialogTrigger
				as={Button}
				color="destructive"
				class="self-start"
				variant="outline"
				icon={() => <Trash2Icon class="size-4" />}
			>
				Delete project
			</AlertDialogTrigger>
			<AlertDialogContent class="flex flex-col gap-2">
				<div class="flex flex-col gap-2">
					<AlertDialogTitle>Delete project</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete this project?
					</AlertDialogDescription>

					<p class="text-sm text-gray-600">
						This operation cannot be undone and it will also do the following
						things:
					</p>

					<ul class="text-sm list-disc pl-6 text-gray-600 flex flex-col gap-2">
						<li>
							All your media files will be deleted, so emails you sent that were
							referencing them will stop being rendered correctly.
						</li>
						<li>
							Verified domains will be deleted. If you'll use them in another
							project in the future you'll have to verify them again, with
							different DNS records.
						</li>
					</ul>

					<p class="text-sm text-gray-600">
						If you're 100% sure, type{" "}
						<code class="bg-gray-200 px-1">{CONFIRM_TEXT}</code> in the input
						below to confirm.
					</p>
				</div>

				<form
					method="post"
					action={deleteProject}
					class="flex gap-2 justify-end flex-col"
				>
					<input type="hidden" name="id" value={props.projectId} />

					<Input
						type="text"
						name="confirm"
						id="confirm"
						required
						aria-label="Confirmation"
						autocomplete="off"
						value={confirmText()}
						onInput={(event) => setConfirmText(event.target.value)}
					/>

					<div class="flex gap-2 justify-end mt-4">
						<Button
							type="button"
							variant="outline"
							class="self-end"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>

						<Button
							type="submit"
							color="destructive"
							class="self-end"
							icon={() => <Trash2Icon class="size-4" />}
							loading={deleteProjectMutation.pending}
							disabled={disabled()}
						>
							Delete
						</Button>
					</div>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
