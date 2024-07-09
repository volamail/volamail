import { Title } from "@solidjs/meta";
import { CircleCheckBigIcon } from "lucide-solid";
import { type RouteSectionProps, createAsync } from "@solidjs/router";

import { Input } from "~/lib/ui/components/input";
import { getProject } from "~/lib/projects/queries";
import { Button } from "~/lib/ui/components/button";
import { editProject } from "~/lib/projects/actions";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { DeleteProjectDialog } from "~/lib/projects/components/delete-project-dialog";

export default function ProjectSettings(props: RouteSectionProps) {
  const project = createAsync(() =>
    getProject({
      teamId: props.params.teamId,
      projectId: props.params.projectId,
    })
  );

  const editProjectAction = useMutation({
    action: editProject,
    onSuccess() {
      showToast({
        title: "Changes saved",
        variant: "success",
      });
    },
    onError(e) {
      console.log(e);
      showToast({
        title: "Unable to save changes",
        variant: "error",
      });
    },
  });

  return (
    <main class="p-8 flex flex-col grow gap-8 max-w-2xl">
      <Title>Project settings - Volamail</Title>

      <h1 class="text-3xl font-bold">Project settings</h1>

      <form class="flex flex-col gap-4" method="post" action={editProject}>
        <input type="hidden" name="id" value={props.params.projectId} />

        <div class="flex gap-4">
          <div class="flex flex-col gap-1 grow">
            <label for="projectId" class="font-medium text-sm">
              Project ID
            </label>
            <Input
              type="text"
              id="projectId"
              value={props.params.projectId}
              disabled
            />
          </div>
          <div class="flex flex-col gap-1 grow">
            <label for="name" class="font-medium text-sm">
              Name
            </label>
            <Input
              type="text"
              name="name"
              id="name"
              value={project()?.name}
              required
            />
            <p class="text-xs text-gray-500">
              This name is only used for display purposes.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          class="self-end"
          icon={() => <CircleCheckBigIcon class="size-4" />}
          loading={editProjectAction.pending}
        >
          Save
        </Button>
      </form>

      <hr class="w-full border-gray-200" />

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Danger zone</h2>

        <DeleteProjectDialog projectId={props.params.projectId} />
      </section>
    </main>
  );
}
