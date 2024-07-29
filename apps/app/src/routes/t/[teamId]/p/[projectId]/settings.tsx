import * as v from "valibot";
import { Title } from "@solidjs/meta";
import { Show, Suspense } from "solid-js";
import { CircleCheckBigIcon } from "lucide-solid";
import { type RouteSectionProps, createAsync } from "@solidjs/router";

import { Input } from "~/lib/ui/components/input";
import { getProject } from "~/lib/projects/queries";
import { Button } from "~/lib/ui/components/button";
import { editProject } from "~/lib/projects/actions";
import { createForm } from "~/lib/ui/hooks/createForm";
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

  return (
    <main class="p-8 flex flex-col grow gap-8 max-w-2xl">
      <Title>Project settings - Volamail</Title>

      <h1 class="text-3xl font-bold">Project settings</h1>

      <Suspense
        fallback={
          <div class="flex flex-col gap-8 animate-pulse">
            <div class="flex gap-4 ">
              <div class="flex flex-col gap-1">
                <div class="w-32 h-4 rounded bg-gray-300" />
                <div class="w-48 h-8 rounded-lg bg-gray-200" />
              </div>
              <div class="flex flex-col gap-1 grow">
                <div class="w-32 h-4 rounded bg-gray-300" />
                <div class="w-full h-8 rounded-lg bg-gray-200" />
              </div>
            </div>
            <div class="w-24 h-8 rounded-lg bg-gray-400 self-end" />
          </div>
        }
      >
        <Show when={project()}>
          {(project) => <SettingsForm project={project()} />}
        </Show>
      </Suspense>

      <hr class="w-full border-gray-200" />

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Danger zone</h2>

        <DeleteProjectDialog projectId={props.params.projectId} />
      </section>
    </main>
  );
}

type SettingsFormProps = {
  project: {
    id: string;
    name: string;
  };
};

function SettingsForm(props: SettingsFormProps) {
  const editProjectAction = useMutation({
    action: editProject,
    onSuccess() {
      showToast({
        title: "Changes saved",
        variant: "success",
      });
    },
    onError(e) {
      showToast({
        title: e.statusMessage || "Unable to save changes",
        variant: "error",
      });
    },
  });

  const { form, fields, handleSubmit } = createForm({
    defaultValues: {
      name: props.project.name,
    },
    schema: v.object({
      name: v.pipe(
        v.string(),
        v.minLength(2, "Name must have at least 2 characters"),
        v.maxLength(64)
      ),
    }),
  });

  return (
    <form
      onSubmit={handleSubmit}
      class="flex flex-col gap-4 w-full"
      method="post"
      action={editProject}
    >
      <input type="hidden" name="id" value={props.project.id} />

      <div class="flex gap-4">
        <Input label="Project ID" disabled value={props.project.id} />

        <Input
          required
          {...fields.name}
          hint="This is used as the sender's name in emails."
          label="Name"
        />
      </div>

      <Button
        type="submit"
        class="self-end"
        icon={() => <CircleCheckBigIcon class="size-4" />}
        loading={editProjectAction.pending}
        disabled={form.invalid || !form.dirty}
      >
        Save
      </Button>
    </form>
  );
}
