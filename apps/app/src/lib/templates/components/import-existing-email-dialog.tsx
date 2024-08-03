import { createAsync } from "@solidjs/router";
import {
  ArrowRightIcon,
  CircleCheck,
  CircleIcon,
  LoaderIcon,
} from "lucide-solid";
import { createMemo, createSignal } from "solid-js";
import { For, Show, Suspense } from "solid-js";

import { getTemplateInForm } from "~/lib/templates/actions";
import { getProjectTemplates } from "~/lib/templates/queries";
import { Button } from "~/lib/ui/components/button";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/lib/ui/components/dialog";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
  projectId: string;
  onComplete: (email: { subject: string; body: string; slug: string }) => void;
  filter?: (email: { id: string; slug: string; subject: string }) => boolean;
};

export function ImportExistingEmailDialogContents(props: Props) {
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

  const projectEmails = createAsync(
    () => getProjectTemplates(props.projectId),
    {}
  );

  function toggleEmailSelection(id: string) {
    if (selectedEmailId() === id) {
      return setSelectedEmailId();
    }

    setSelectedEmailId(id);
  }

  const filteredEmails = createMemo(() => {
    if (!props.filter || !projectEmails()?.length) {
      return projectEmails()!;
    }

    return projectEmails()!.filter(props.filter);
  });

  return (
    <DialogContent
      as="form"
      method="post"
      class="flex flex-col"
      action={getTemplateInForm}
    >
      <div class="flex flex-col gap-2">
        <DialogTitle>Import existing email</DialogTitle>

        <DialogDescription>
          Choose a template to import from your project's existing emails.
        </DialogDescription>
      </div>

      <div
        class="border border-gray-300 rounded-lg h-64 overflow-y-auto bg-gray-100 flex flex-col relative p-1 gap-1"
        role="listbox"
      >
        <Suspense
          fallback={<LoaderIcon class="size-4 mx-auto my-2 animate-spin" />}
        >
          <Show
            when={filteredEmails()?.length}
            fallback={
              <p class="text-center text-sm text-gray-500 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                No emails in the project yet.
              </p>
            }
          >
            <For each={filteredEmails()}>
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
  );
}
