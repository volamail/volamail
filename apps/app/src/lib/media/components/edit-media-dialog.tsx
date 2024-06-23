import {
  CircleCheckBigIcon,
  Edit2Icon,
  EditIcon,
  PlusIcon,
  SendIcon,
} from "lucide-solid";
import { createEffect, createSignal } from "solid-js";

import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "~/lib/ui/components/dialog";
import { editMedia } from "../actions";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
  projectId: string;
  media: {
    id: string;
    name: string;
  };
};

export function EditMediaDialog(props: Props) {
  const [open, setOpen] = createSignal(false);

  const [name, setName] = createSignal(props.media.name);

  const editMediaAction = useMutation({
    action: editMedia,
    onSuccess() {
      showToast({
        title: "Changes applied",
        variant: "success",
      });

      setOpen(false);
    },
    onError() {
      setOpen(false);

      showToast({
        title: "Unable to apply changes",
        variant: "error",
      });
    },
    filter(params) {
      const formData = params[0];

      return formData.get("id") === props.media.id;
    },
  });

  function handleFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;

    if (!files) {
      return;
    }

    const file = files[0];

    setName(file.name);
  }

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger
        as={Button}
        class="self-start p-1"
        variant="ghost"
        icon={() => <EditIcon class="size-4" />}
        aria-label="Edit media"
        even
      />
      <DialogContent class="flex flex-col gap-6">
        <DialogTitle>Edit media</DialogTitle>

        <form class="flex flex-col gap-4" method="post" action={editMedia}>
          <input type="hidden" name="projectId" value={props.projectId} />
          <input type="hidden" name="id" value={props.media.id} />

          <div class="flex flex-col gap-1">
            <label for="name" class="font-medium text-sm">
              Name
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              value={name()}
              onChange={(event) => setName(event.target.value)}
            />
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
              onChange={handleFileChange}
            />
          </div>

          <Button
            type="submit"
            class="self-end"
            icon={() => <CircleCheckBigIcon class="size-4" />}
            loading={editMediaAction.pending}
          >
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
