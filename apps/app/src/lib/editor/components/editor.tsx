import {
  Show,
  onCleanup,
  createMemo,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import quotedPrintable from "quoted-printable";
import {
  EyeIcon,
  CodeIcon,
  SendIcon,
  UndoIcon,
  Trash2Icon,
  Table2Icon,
  CloudDownloadIcon,
} from "lucide-solid";

import { ImagePicker } from "./image-picker";
import { FloatingMenu } from "./floating-menu";
import { Button, buttonVariants } from "~/lib/ui/components/button";
import { PasteHtmlButton } from "./paste-html-button";
import { showToast } from "~/lib/ui/components/toasts";
import { Textarea } from "~/lib/ui/components/textarea";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { generateTemplate } from "~/lib/templates/actions";
import { StartFromEmailDialogContents } from "./start-from-email-dialog";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { DeleteTemplateDialog } from "~/lib/templates/components/DeleteTemplateDialog";
import { Dialog, DialogTrigger } from "~/lib/ui/components/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/lib/ui/components/tooltip";
import { Kbd } from "~/lib/ui/components/kbd";

type Props = {
  name?: string;
  value?: string;
  projectId: string;
  templateId?: string;
  onChange: (value: string | undefined) => void;
};

export function Editor(props: Props) {
  let mainForm!: HTMLFormElement;
  let templatePreview!: HTMLDivElement;
  let promptInput!: HTMLTextAreaElement;

  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);
  const [selectedElement, setSelectedElement] = createSignal<HTMLElement>();
  const [selectedImageUrl, setSelectedImageUrl] = createSignal<string>();
  const [history, setHistory] = createSignal<string[]>([]);
  const [importExistingDialogOpen, setImportExistingDialogOpen] =
    createSignal(false);

  const generateTemplateAction = useMutation({
    action: generateTemplate,
    onSuccess(result) {
      mainForm.reset();

      setSelectedImageUrl();

      persistCurrentToHistory();

      props.onChange(result.code);
    },
    onError() {
      showToast({
        title: "Unable to generate template",
        variant: "error",
      });
    },
  });

  function handleElementClick(event: MouseEvent) {
    event.preventDefault();

    const target = event.target as HTMLElement;

    // for now let's ignore the containing div
    if (target instanceof HTMLDivElement) {
      return;
    }

    setSelectedElement(target);
  }

  createEffect(() => {
    if (selectedElement()) {
      const element = selectedElement()!;

      element.dataset.selected = "true";

      onCleanup(() => {
        if (element) {
          delete element.dataset.selected;
        }
      });
    }
  });

  function handleTemplatePreviewMounted(element: HTMLDivElement) {
    templatePreview = element;

    element.addEventListener("click", handleElementClick);

    onCleanup(() => {
      element.removeEventListener("click", handleElementClick);
    });
  }

  function modifyElement(changes: string) {
    const element = selectedElement();

    if (!element) {
      return;
    }

    element.outerHTML = changes;

    persistCurrentToHistory();

    props.onChange(deserializeCode(templatePreview.innerHTML));

    setSelectedElement();
  }

  function deleteElement() {
    const element = selectedElement();

    if (!element) {
      return;
    }

    element.remove();

    persistCurrentToHistory();

    props.onChange(deserializeCode(templatePreview.innerHTML));

    setSelectedElement();
  }

  function handleSelectImage(imageUrl?: string) {
    setSelectedImageUrl(imageUrl);

    promptInput.focus();
  }

  function handleUndo() {
    const prevValue = history()[history().length - 1];

    if (!prevValue) {
      return;
    }

    props.onChange(prevValue);

    setHistory(history().slice(0, -1));
  }

  const displayedCode = createMemo(() => {
    const rawCode = props.value;

    if (!rawCode) {
      return;
    }

    return serializeCode(rawCode);
  });

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "z" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();

      handleUndo();
    }
  }

  function handleImportFromExistingComplete(value: string) {
    setImportExistingDialogOpen(false);

    persistCurrentToHistory();

    props.onChange(value);
  }

  function persistCurrentToHistory() {
    if (!props.value) {
      return;
    }

    setHistory([
      ...(history().length === 6 ? history().slice(1) : history()),
      props.value,
    ]);
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);
    });
  });

  return (
    <GridBgContainer class="grow min-h-0 flex flex-col gap-2 justify-center items-center p-8">
      <Show when={props.value}>
        <Tabs class="grow min-h-0 flex flex-col gap-2 w-full relative">
          <div class="flex justify-between items-end">
            <Tabs.List class="border border-gray-300 inline-flex self-start text-sm items-center bg-gray-200 rounded-lg p-1">
              <Tabs.Trigger
                value="preview"
                class="rounded-lg inline-flex transition-colors gap-1.5 items-center data-[selected]:bg-gray-100 px-3 py-1 data-[selected]:font-medium data-[selected]:text-black text-gray-600"
              >
                Preview
                <EyeIcon class="size-4" />
              </Tabs.Trigger>
              <Tabs.Trigger
                value="html"
                class="rounded-lg inline-flex transition-colors gap-1.5 items-center data-[selected]:bg-gray-100 px-3 py-1 data-[selected]:font-medium data-[selected]:text-black text-gray-600"
              >
                HTML
                <CodeIcon class="size-4" />
              </Tabs.Trigger>
            </Tabs.List>

            <div class="flex gap-2 items-center">
              <Show when={history().length}>
                <div class="flex gap-2 items-center">
                  <Tooltip>
                    <TooltipTrigger
                      as={Button}
                      type="button"
                      variant="outline"
                      icon={() => <UndoIcon class="size-4" />}
                      aria-label="Undo changes"
                      onClick={handleUndo}
                      even
                    />
                    <TooltipContent class="inline-flex gap-1.5 items-center">
                      Undo changes
                      <Kbd>Ctrl/Cmd + Z</Kbd>
                    </TooltipContent>
                  </Tooltip>

                  <div class="h-6 border-r border-gray-300" />
                </div>
              </Show>
              <Dialog
                open={importExistingDialogOpen()}
                onOpenChange={setImportExistingDialogOpen}
              >
                <Tooltip>
                  <TooltipTrigger
                    as={DialogTrigger}
                    aria-label="Import existing email template"
                    class={buttonVariants({
                      variant: "outline",
                      even: true,
                    })}
                  >
                    <CloudDownloadIcon class="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Import existing email template
                  </TooltipContent>
                </Tooltip>

                <StartFromEmailDialogContents
                  filter={(email) => email.id !== props.templateId}
                  projectId={props.projectId}
                  onComplete={(email) =>
                    handleImportFromExistingComplete(email.body)
                  }
                />
              </Dialog>
              <Tooltip>
                <TooltipTrigger
                  as={Button}
                  variant="outline"
                  color="destructive"
                  class="self-end"
                  aria-label="Delete email"
                  onClick={() => setDeleteDialogOpen(true)}
                  even
                  icon={() => <Trash2Icon class="size-4" />}
                />
                <TooltipContent class="inline-flex gap-1.5 items-center">
                  Delete email
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Tabs.Content
            value="preview"
            class="relative overflow-y-auto grow bg-white border border-gray-200 w-full rounded-xl shadow"
          >
            <div
              ref={handleTemplatePreviewMounted}
              class="revert-tailwind"
              innerHTML={displayedCode()}
            />

            <Show when={selectedElement()}>
              {(element) => (
                <FloatingMenu
                  element={element()}
                  projectId={props.projectId}
                  onComplete={modifyElement}
                  onDelete={deleteElement}
                  onClose={() => setSelectedElement()}
                  onChangeSelection={setSelectedElement}
                />
              )}
            </Show>
          </Tabs.Content>
          <Tabs.Content
            value="html"
            class="relative overflow-y-auto grow min-h-0 flex flex-col bg-white border border-gray-200 w-full rounded-xl shadow"
          >
            <pre class="p-4 min-h-0 text-sm whitespace-pre-wrap">
              {props.value}
            </pre>
          </Tabs.Content>
        </Tabs>
      </Show>

      <form
        method="post"
        action={generateTemplate}
        class="w-full z-10"
        ref={mainForm}
      >
        <input type="hidden" name="projectId" value={props.projectId} />

        <Show when={props.value}>
          <input type="hidden" name="currentHtml" value={props.value} />
        </Show>

        <div class="flex flex-col gap-64 items-center">
          <Show when={!props.value}>
            <div class="flex flex-col gap-12 w-full items-center">
              <div class="flex flex-col gap-2">
                <h1 class="text-4xl font-bold text-center">Create email</h1>
                <p class="text-center text-gray-600 text-sm">
                  Use an existing email as a starting point or start from
                  scratch.
                </p>
              </div>

              <div class="flex gap-4 max-w-3xl w-full">
                <Dialog>
                  <DialogTrigger class="font-medium cursor-default flex-1 rounded-lg bg-gray-200 shadow p-4 text-sm inline-flex gap-2 items-center hover:bg-gray-300 transition-colors">
                    <Table2Icon class="size-8 bg-black text-white rounded-lg p-2" />
                    Start from another email
                  </DialogTrigger>

                  <StartFromEmailDialogContents
                    projectId={props.projectId}
                    onComplete={(email) => props.onChange(email.body)}
                  />
                </Dialog>

                <PasteHtmlButton onPaste={props.onChange} />
              </div>
            </div>
          </Show>

          <div
            class="w-full flex gap-2"
            classList={{ "max-w-3xl": !props.value }}
          >
            <Textarea
              name="prompt"
              required
              loading={generateTemplateAction.pending}
              resizeable
              submitOnEnter
              autofocus
              leading={() => (
                <div class="flex gap-1 shrink-0 items-center py-1">
                  <ImagePicker
                    projectId={props.projectId}
                    onSelect={handleSelectImage}
                  />
                  <Show when={selectedImageUrl()}>
                    <span class="text-gray-500 text-sm">Using this image,</span>
                    <input
                      type="hidden"
                      name="image"
                      value={selectedImageUrl()}
                    />
                  </Show>
                </div>
              )}
              ref={promptInput}
              trailing={() => (
                <Button
                  type="submit"
                  aria-label="Request changes"
                  class="p-2 mt-0.5"
                  round
                  even
                  icon={() => <SendIcon class="size-3" />}
                />
              )}
              class="py-1 gap-1"
              placeholder={
                selectedImageUrl()
                  ? "create an invite email and put the image on top."
                  : "A welcome e-mail with a magic link button..."
              }
            />
          </div>
        </div>
      </form>

      <input type="hidden" name={props.name} value={props.value} />

      <Show when={props.templateId}>
        {(templateId) => (
          <DeleteTemplateDialog
            projectId={props.projectId}
            templateId={templateId()}
            open={deleteDialogOpen()}
            onClose={() => setDeleteDialogOpen(false)}
          />
        )}
      </Show>
    </GridBgContainer>
  );
}

/**
 * These two functions are needed to make
 * email HTML displayable in the browser and,
 * viceversa, to convert the code displayed
 * in the editor back to email-valid HTML.
 */

function serializeCode(code: string) {
  const decoded = quotedPrintable.decode(code);

  return replaceLast(
    decoded.replaceAll(`data-selected="true"`, "").replace("<body", "<div"),
    "</body>",
    "</div>"
  );
}

function deserializeCode(code: string) {
  const decoded = quotedPrintable.decode(code);

  return replaceLast(
    decoded.replaceAll(`data-selected="true"`, "").replace("<div", "<body"),
    "</div>",
    "</body>"
  );
}

function replaceLast(text: string, searchValue: string, replaceValue: string) {
  const lastOccurrenceIndex = text.lastIndexOf(searchValue);

  return `${text.slice(0, lastOccurrenceIndex)}${replaceValue}${text.slice(
    lastOccurrenceIndex + searchValue.length
  )}`;
}
