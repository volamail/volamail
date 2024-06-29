import { PlusIcon } from "lucide-solid";
import { createSignal } from "solid-js";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "~/lib/ui/components/dialog";
import { createProject } from "../actions";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
  team: {
    id: string;
    name: string;
  };
};

export function CreateProjectDialog(props: Props) {
  const [open, setOpen] = createSignal(false);

  const createProjectAction = useMutation({
    action: createProject,
    onSuccess() {
      showToast({
        title: "Project created!",
        variant: "success",
      });
    },
    onError(e) {
      console.log(e);
      showToast({
        title: "Unable to create project",
        variant: "error",
      });
    },
  });

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger
        as={Button}
        class="self-start p-0.5 "
        icon={() => <PlusIcon class="size-4 text-gray-500" />}
        round
        even
        variant="ghost"
        aria-label={`Create project under ${props.team.name}`}
      />
      <DialogContent class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            This project will be created under{" "}
            <span class="font-medium text-black">{props.team.name}</span>.
          </DialogDescription>
        </div>

        <form class="flex flex-col gap-4" method="post" action={createProject}>
          <input type="hidden" name="teamId" value={props.team.id} />

          <div class="flex flex-col gap-1">
            <label for="name" class="font-medium text-sm">
              Name
            </label>
            <Input
              id="name"
              name="name"
              required
              placeholder="My new project"
            />
          </div>

          <Button
            type="submit"
            class="self-end"
            icon={() => <PlusIcon class="size-4" />}
            loading={createProjectAction.pending}
          >
            Create project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
