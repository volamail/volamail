import { Table2Icon } from "lucide-solid";
import { generateTemplate } from "~/lib/templates/actions";
import { Dialog, DialogTrigger } from "~/lib/ui/components/dialog";
import { ImportExistingEmailDialogContents } from "./import-existing-email-dialog";
import { PasteHtmlButton } from "./paste-html-button";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { showToast } from "~/lib/ui/components/toasts";
import { createSignal } from "solid-js";
import { PromptInput } from "./prompt-input";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

type Props = {
  projectId: string;
  onDone: (code: string) => void;
};

export function EditorStartingScreen(props: Props) {
  const generateTemplateAction = useMutation({
    action: generateTemplate,
    onError() {
      showToast({
        title: "Error while generating",
        variant: "error",
      });
    },
    onSuccess(result) {
      props.onDone(result.code);
    },
  });

  const [selectedImageUrl, setSelectedImageUrl] = createSignal<string>();

  function handleSelectImage(imageUrl?: string) {
    setSelectedImageUrl(imageUrl);
  }

  return (
    <GridBgContainer class="w-full">
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
                <DialogTrigger class="font-medium cursor-default flex-1 rounded-lg bg-gray-200 shadow p-4 text-sm inline-flex gap-2 items-center hover:bg-gray-300 transition-colors">
                  <Table2Icon class="size-8 bg-black text-white rounded-lg p-2" />
                  Start from another email
                </DialogTrigger>

                <ImportExistingEmailDialogContents
                  projectId={props.projectId}
                  onComplete={(email) => props.onDone(email.body)}
                />
              </Dialog>

              <PasteHtmlButton onPaste={props.onDone} />
            </div>
          </div>

          <div class="w-full flex gap-2 max-w-3xl">
            <PromptInput
              loading={generateTemplateAction.pending}
              projectId={props.projectId}
              selectedImageUrl={selectedImageUrl()}
              onSelectImage={handleSelectImage}
            />
          </div>
        </div>
      </form>
    </GridBgContainer>
  );
}
