import * as v from "valibot";
import { CircleCheckBigIcon } from "lucide-solid";

import { editProject } from "../actions";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { createForm } from "~/lib/ui/hooks/createForm";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type SettingsFormProps = {
  project: {
    id: string;
    name: string;
  };
};

export function SettingsForm(props: SettingsFormProps) {
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

  const form = createForm<{
    name: string;
  }>({
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
      onSubmit={form.handleSubmit}
      class="flex flex-col gap-8 w-full"
      method="post"
      action={editProject}
    >
      <input type="hidden" name="id" value={props.project.id} />

      <div class="flex gap-4 w-full">
        <Input label="Project ID" disabled value={props.project.id} />

        <Input
          required
          class="grow"
          {...form.getFieldProps("name")}
          hint="This is used as the sender's name in emails."
          label="Name"
        />
      </div>

      <Button
        type="submit"
        class="self-end"
        icon={() => <CircleCheckBigIcon class="size-4" />}
        loading={editProjectAction.pending}
        disabled={form.state.invalid || !form.state.dirty}
      >
        Save
      </Button>
    </form>
  );
}
