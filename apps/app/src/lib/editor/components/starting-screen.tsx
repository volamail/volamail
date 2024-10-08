import { Table2Icon } from "lucide-solid";
import { createAsync } from "@solidjs/router";
import { createSignal, Show, lazy, Suspense } from "solid-js";

import { getProject } from "~/lib/projects/queries";
import { PasteHtmlButton } from "./paste-html-button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { generateTemplate } from "~/lib/templates/actions";
import { PromptInput, PromptInputSkeleton } from "./prompt-input";
import { Dialog, DialogTrigger } from "~/lib/ui/components/dialog";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { ImportExistingEmailDialogContents } from "~/lib/templates/components/import-existing-email-dialog";

type Props = {
  teamId: string;
  projectId: string;
  onDone: (email: { html: string; subject: string; slug: string }) => void;
};

const ContextHintIllustration = lazy(
  () => import("./context-hint-illustration")
);

export function EditorStartingScreen(props: Props) {
  const project = createAsync(() =>
    getProject({
      teamId: props.teamId,
      projectId: props.projectId,
    })
  );

  const generateTemplateAction = useMutation({
    action: generateTemplate,
    onError() {
      showToast({
        title: "Error while generating",
        variant: "error",
      });
    },
    onSuccess(result) {
      props.onDone(result);
    },
  });

  const [selectedImageUrl, setSelectedImageUrl] = createSignal<string>();

  function handleSelectImage(imageUrl?: string) {
    setSelectedImageUrl(imageUrl);
  }

  function handleExistingEmailImported(email: {
    subject: string;
    body: string;
    slug: string;
  }) {
    props.onDone({
      html: email.body,
      subject: email.subject,
      slug: email.slug,
    });
  }

  return (
    <GridBgContainer class="w-full p-8">
      <form
        method="post"
        action={generateTemplate}
        class="w-full z-10 flex flex-col justify-center items-center"
      >
        <input type="hidden" name="projectId" value={props.projectId} />

        <div class="flex flex-col gap-64 items-center w-full">
          <div class="flex flex-col gap-12 w-full items-center">
            <div class="flex flex-col gap-2">
              <h1 class="text-4xl font-bold text-center">Create email</h1>
              <p class="text-center text-gray-600 text-sm">
                Use an existing email as a starting point or start from scratch.
              </p>
            </div>

            <div class="flex gap-4 max-w-3xl w-full">
              <Dialog>
                <DialogTrigger class="cursor-default text-left flex-1 rounded-lg bg-gray-200 shadow p-4 text-sm inline-flex flex-col gap-2 items-start hover:bg-gray-300 transition-colors">
                  <Table2Icon class="size-8 bg-black text-white rounded-lg p-2" />
                  <div class="flex mt-1 flex-col items-start gap-1">
                    <p class="font-medium">Start from another email</p>
                    <p class="text-gray-500 text-xs">
                      Choose a starting template from this project's emails.
                    </p>
                  </div>
                </DialogTrigger>

                <ImportExistingEmailDialogContents
                  projectId={props.projectId}
                  onComplete={handleExistingEmailImported}
                />
              </Dialog>

              <PasteHtmlButton
                onPaste={(code) =>
                  props.onDone({
                    html: code,
                    subject: "",
                    slug: "",
                  })
                }
              />
            </div>
          </div>

          <div class="w-full flex gap-2 max-w-3xl relative">
            <Suspense fallback={<PromptInputSkeleton />}>
              <Show when={project()}>
                {(project) => (
                  <>
                    <Show when={!project().context}>
                      <ContextHintIllustration />
                    </Show>

                    <PromptInput
                      loading={generateTemplateAction.pending}
                      project={project()!}
                      selectedImageUrl={selectedImageUrl()}
                      onSelectImage={handleSelectImage}
                    />
                  </>
                )}
              </Show>
            </Suspense>
          </div>
        </div>
      </form>
    </GridBgContainer>
  );
}
