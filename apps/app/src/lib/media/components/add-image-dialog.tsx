import { createSignal } from "solid-js";
import { PlusIcon } from "lucide-solid";

import {
	Dialog,
	DialogTitle,
	DialogTrigger,
	DialogContent,
} from "~/lib/ui/components/dialog";
import { addImage } from "../actions";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
	projectId: string;
};

export function AddImageDialog(props: Props) {
	const [open, setOpen] = createSignal(false);

	const createImageAction = useMutation({
		action: addImage,
		onSuccess() {
			showToast({
				title: "Image added",
				variant: "success",
			});

			setOpen(false);
		},
		onError(e) {
			showToast({
				title: e.statusMessage || "Unable to add image",
				variant: "error",
			});
		},
	});

	return (
		<Dialog open={open()} onOpenChange={setOpen}>
			<DialogTrigger
				as={Button}
				class="self-start mt-1"
				icon={() => <PlusIcon class="size-4" />}
			>
				Add image
			</DialogTrigger>
			<DialogContent class="flex flex-col gap-6">
				<DialogTitle>Add image</DialogTitle>

				<form
					class="flex flex-col gap-4"
					method="post"
					action={addImage}
					autocomplete="off"
					enctype="multipart/form-data"
				>
					<input type="hidden" name="projectId" value={props.projectId} />

					<div class="flex flex-col gap-1">
						<label for="name" class="font-medium text-sm">
							Name
						</label>
						<Input type="text" id="name" name="name" required />
					</div>

					<div class="flex flex-col gap-1">
						<label for="file" class="font-medium text-sm">
							File
						</label>
						<Input
							type="file"
							id="file"
							name="file"
							accept="image/png, image/jpeg"
						/>
					</div>

					<Button
						type="submit"
						class="self-end"
						icon={() => <PlusIcon class="size-4" />}
						loading={createImageAction.pending}
					>
						Add image
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
