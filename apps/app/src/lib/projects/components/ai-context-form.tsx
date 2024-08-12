import * as v from "valibot";
import { CircleCheckBigIcon } from "lucide-solid";

import { editProjectContext } from "../actions";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { createForm } from "~/lib/ui/hooks/createForm";
import { Textarea } from "~/lib/ui/components/textarea";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type AIContextFormProps = {
  project: {
    id: string;
    context?: string | null;
  };
};

export function AIContextForm(props: AIContextFormProps) {
  const editContextAction = useMutation({
    action: editProjectContext,
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
    context: string;
  }>({
    defaultValues: {
      context: props.project.context || "",
    },
    schema: v.object({
      context: v.pipe(
        v.string(),
        v.minLength(2, "Context must have at least 2 characters"),
        v.maxLength(200, "Context must be less than 200 characters")
      ),
    }),
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      class="flex flex-col gap-8 w-full"
      method="post"
      action={editProjectContext}
    >
      <input type="hidden" name="projectId" value={props.project.id} />
      <Textarea
        rows={5}
        id="context"
        {...form.getFieldProps("context")}
        label="AI Context"
        hint="This will be fed to the AI when prompting to give you the best results."
      >
        {form.getFieldProps("context").value}
      </Textarea>

      <Button
        type="submit"
        class="self-end"
        icon={() => <CircleCheckBigIcon class="size-4" />}
        loading={editContextAction.pending}
        disabled={form.state.invalid || !form.state.dirty}
      >
        Save
      </Button>
    </form>
  );
}
