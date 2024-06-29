import { createAsync } from "@solidjs/router";
import {
  ArrowRightIcon,
  CircleCheck,
  CircleIcon,
  LoaderIcon,
  Table2Icon,
} from "lucide-solid";
import { createSignal } from "solid-js";
import { For, Show, Suspense } from "solid-js";

import { getTemplateInForm } from "~/lib/templates/actions";
import { getProjectTemplates } from "~/lib/templates/queries";
import { Button } from "~/lib/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/lib/ui/components/dialog";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
  projectId: string;
  onComplete: (email: { subject: string; body: string }) => void;
};

export function StartFromEmailDialog(props: Props) {
  const [open, setOpen] = createSignal(false);

  const getTemplateInFormAction = useMutation({
    action: getTemplateInForm,
    onSuccess(result) {
      showToast({
        title: "Template loaded",
        variant: "success",
      });

      props.onComplete(result);
    },
    onError() {
      showToast({
        title: "Unable to load template",
        variant: "error",
      });
    },
  });

  const [selectedEmailId, setSelectedEmailId] = createSignal<string>();

  const projectEmails = createAsync(() => getProjectTemplates(props.projectId));

  function toggleEmailSelection(id: string) {
    if (selectedEmailId() === id) {
      return setSelectedEmailId();
    }

    setSelectedEmailId(id);
  }

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger class="font-medium cursor-default flex-1 rounded-lg bg-gray-200 shadow p-4 text-sm inline-flex gap-2 items-center hover:bg-gray-300 transition-colors">
        <Table2Icon class="size-8 bg-black text-white rounded-lg p-2" />
        Start from another email
      </DialogTrigger>

      <DialogContent
        as="form"
        method="post"
        class="flex flex-col"
        action={getTemplateInForm}
      >
        <div class="flex flex-col gap-2">
          <DialogTitle>Start from email</DialogTitle>

          <DialogDescription>
            Choose a template to start with, from your project's emails.
          </DialogDescription>
        </div>

        <div
          class="border border-gray-300 rounded-lg h-64 overflow-y-auto bg-gray-100 flex flex-col relative p-1"
          role="listbox"
        >
          <Suspense fallback={<LoaderIcon class="size-4 mx-auto my-2 animate-spin" />}>
            <Show
              when={projectEmails()?.length}
              fallback={
                <p class="text-center text-sm text-gray-500 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  No emails in the project yet.
                </p>
              }
            >
              <For each={projectEmails()}>
                {(email) => (
                  <button
                    type="button"
                    class="cursor-default rounded-md w-full text-sm flex justify-between items-center py-2 px-3 border shadow-sm bg-white border-gray-300"
                    role="option"
                    aria-selected={email.id === selectedEmailId()}
                    onClick={() => toggleEmailSelection(email.id)}
                  >
                    <span class="block font-medium truncate">{email.slug}</span>
                    <Show
                      when={email.id === selectedEmailId()}
                      fallback={<CircleIcon class="size-5" />}
                    >
                      <div class="relative size-5">
                        <CircleCheck class="absolute inset-0 size-5 bg-black text-white rounded-full " />
                        <CircleCheck class="absolute inset-0 size-5 bg-black text-white rounded-full animate-ping repeat-1" />
                      </div>
                    </Show>
                  </button>
                )}
              </For>
            </Show>
          </Suspense>
        </div>

        <Show when={selectedEmailId()}>
          <input type="hidden" name="id" value={selectedEmailId()} />
        </Show>

        <Button
          type="submit"
          class="self-end"
          disabled={!selectedEmailId()}
          loading={getTemplateInFormAction.pending}
          icon={() => <ArrowRightIcon class="size-4" />}
        >
          Use this email
        </Button>
      </DialogContent>
    </Dialog>
  );
}
