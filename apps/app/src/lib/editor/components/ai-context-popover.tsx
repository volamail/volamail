import * as v from "valibot";
import { BrainIcon } from "lucide-solid";
import { createMutation } from "@tanstack/solid-query";

import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "~/lib/ui/components/popover";
import { Button, buttonVariants } from "~/lib/ui/components/button";
import { createForm } from "~/lib/ui/hooks/createForm";
import { Textarea } from "~/lib/ui/components/textarea";
import { editProjectContext } from "~/lib/projects/actions";
import { createSignal } from "solid-js";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/lib/ui/components/tooltip";

type Props = {
  projectId: string;
  defaultContext?: string | null;
  onChange?: (context: string) => void;
};

const formSchema = v.object({
  context: v.pipe(
    v.string(),
    v.maxLength(200, "Context must have less than 200 characters")
  ),
});

type ContextForm = v.InferInput<typeof formSchema>;

export function AiContextPopover(props: Props) {
  const [open, setOpen] = createSignal(false);

  const editProjectContextMutation = useMutation({
    action: editProjectContext,
    onSuccess() {
      setOpen(false);

      showToast({
        title: "Context updated",
        variant: "success",
      });
    },
    onError(e) {
      showToast({
        title: e.statusMessage || "Unable to update context",
        variant: "error",
      });
    },
  });

  const form = createForm<ContextForm>({
    defaultValues: {
      context: props.defaultContext || "",
    },
    schema: formSchema,
    validateBeforeSubmit: true,
  });

  function handleSubmit(event: SubmitEvent) {
    form.handleSubmit(event);

    const formData = new FormData(event.target as HTMLFormElement);

    const context = formData.get("context") as string;

    props.onChange?.(context);

    const submitter = (event.submitter as HTMLButtonElement | null)?.value;

    if (submitter === "update") {
      setOpen(false);

      event.preventDefault();

      return;
    }
  }

  return (
    <>
      <PopoverRoot placement="top" open={open()} onOpenChange={setOpen}>
        <Tooltip>
          <PopoverTrigger
            as={TooltipTrigger}
            class={buttonVariants({
              class: "p-1",
              variant: "ghost",
              even: true,
            })}
            aria-label="Edit AI project context"
            variant="ghost"
          >
            <BrainIcon class="size-4" />
          </PopoverTrigger>
          <TooltipContent>AI project context</TooltipContent>
        </Tooltip>
        <PopoverContent class="p-4 w-96 rounded-lg">
          <form
            class="flex flex-col gap-2"
            method="post"
            action={editProjectContext}
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="projectId" value={props.projectId} />

            <div class="flex flex-col">
              <h2 class="font-medium text-sm">Project context</h2>
              <p class="text-xs text-gray-500">
                This is sent to the AI model as the description of the project.
              </p>
            </div>

            <Textarea
              {...form.getTextareaProps("context")}
              class="w-full h-full mt-1"
              classes={{
                container: "rounded-sm",
              }}
              rows={5}
              aria-label="AI context"
            />

            <div class="flex gap-2 justify-end">
              <Button
                type="submit"
                name="action"
                value="set-default"
                variant="outline"
                loading={editProjectContextMutation.pending}
                disabled={form.state.invalid || !form.state.dirty}
              >
                Set as default
              </Button>
              <Button
                type="submit"
                name="action"
                value="update"
                disabled={form.state.invalid || !form.state.dirty}
              >
                Update
              </Button>
            </div>
          </form>
        </PopoverContent>
      </PopoverRoot>
    </>
  );
}
