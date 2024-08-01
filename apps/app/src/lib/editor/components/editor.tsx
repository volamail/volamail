import {
  Show,
  onCleanup,
  createMemo,
  createEffect,
  createSignal,
  onMount,
  Suspense,
  lazy,
} from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import quotedPrintable from "quoted-printable";
import {
  EyeIcon,
  CodeIcon,
  UndoIcon,
  Trash2Icon,
  CloudDownloadIcon,
  LoaderIcon,
} from "lucide-solid";

import { FloatingMenu } from "./floating-menu";
import { Button, buttonVariants } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { editHtmlTemplate } from "~/lib/templates/actions";
import { ImportExistingEmailDialogContents } from "./import-existing-email-dialog";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { DeleteTemplateDialog } from "~/lib/templates/components/delete-template-dialog";
import { Dialog, DialogTrigger } from "~/lib/ui/components/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/lib/ui/components/tooltip";
import { Kbd } from "~/lib/ui/components/kbd";
import { PromptInput } from "./prompt-input";

type Props = {
  name?: string;
  value?: string;
  projectId: string;
  templateId?: string;
  onChange: (value: string | undefined) => void;
};

const HtmlTab = lazy(() => import("./html-tab"));

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

  const isNewEmail = createMemo(() => props.templateId === undefined);

  const editTemplateAction = useMutation({
    action: editHtmlTemplate,
    onSuccess(result) {
      mainForm.reset();

      setSelectedImageUrl();

      persistCurrentToHistory();

      tryViewTransition(() => {
        props.onChange(result);
      });
    },
    onError(e) {
      console.log(e);

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

    if (target instanceof HTMLSpanElement) {
      setSelectedElement(target.parentElement as HTMLElement);
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

  function modifyElement(
    changes: string,
    options: { inline?: boolean } = { inline: false }
  ) {
    const element = selectedElement();

    if (!element) {
      return;
    }

    persistCurrentToHistory();

    props.onChange(deserializeCode(templatePreview.innerHTML));

    if (!options.inline) {
      setSelectedElement();
    }
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

    tryViewTransition(() => {
      props.onChange(prevValue);
    });

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
    <GridBgContainer class="bg-grid-black/15 grow min-h-0 flex flex-col gap-2 justify-center items-center p-8">
      <Show when={props.value}>
        <Tabs class="grow min-h-0 flex flex-col gap-2 w-full relative">
          <div class="flex justify-between items-end">
            <Tabs.List class="border border-gray-300 inline-flex self-start text-sm items-center bg-gray-200 rounded-lg p-1">
              <Tabs.Trigger
                value="preview"
                class="cursor-default rounded-lg hover:text-gray-800 inline-flex transition-colors gap-1.5 items-center data-[selected]:bg-gray-100 px-3 py-1 data-[selected]:font-medium data-[selected]:text-black text-gray-500"
              >
                Preview
                <EyeIcon class="size-4" />
              </Tabs.Trigger>
              <Tabs.Trigger
                value="html"
                class="cursor-default hover:text-gray-800 rounded-lg inline-flex transition-colors gap-1.5 items-center data-[selected]:bg-gray-100 px-3 py-1 data-[selected]:font-medium data-[selected]:text-black text-gray-500"
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

                <ImportExistingEmailDialogContents
                  filter={(email) => email.id !== props.templateId}
                  projectId={props.projectId}
                  onComplete={(email) =>
                    handleImportFromExistingComplete(email.body)
                  }
                />
              </Dialog>
              <Show when={!isNewEmail()}>
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
              </Show>
            </div>
          </div>
          <Tabs.Content
            value="preview"
            class="relative overflow-y-auto grow bg-white border border-gray-200 w-full rounded-xl shadow"
          >
            <div
              ref={handleTemplatePreviewMounted}
              class="revert-tailwind h-full [&>*]:cursor-pointer"
              id="editor-view"
              innerHTML={displayedCode()}
            />

            <Show when={selectedElement()}>
              {(element) => (
                <FloatingMenu
                  element={element()}
                  projectId={props.projectId}
                  onComplete={modifyElement}
                  onDelete={deleteElement}
                  onClose={setSelectedElement}
                  onChangeSelection={setSelectedElement}
                  onEdit={(changes) => modifyElement(changes, { inline: true })}
                />
              )}
            </Show>
          </Tabs.Content>
          <Show when={props.value}>
            {(code) => (
              <Tabs.Content
                value="html"
                class="relative overflow-y-auto grow min-h-0 flex flex-col bg-white border border-gray-200 w-full rounded-xl shadow"
              >
                <Suspense
                  fallback={
                    <div class="flex flex-col gap-2 justify-center items-center grow text-gray-500">
                      <LoaderIcon class="size-6 animate-spin" />
                      <p class="text-sm text-gray-500">
                        Loading HTML preview...
                      </p>
                    </div>
                  }
                >
                  <HtmlTab code={code()} />
                </Suspense>
              </Tabs.Content>
            )}
          </Show>
        </Tabs>
      </Show>

      <form
        method="post"
        action={editHtmlTemplate}
        class="w-full z-10"
        ref={mainForm}
      >
        <input type="hidden" name="projectId" value={props.projectId} />

        <input type="hidden" name="html" value={props.value} />

        <PromptInput
          ref={promptInput}
          loading={editTemplateAction.pending}
          projectId={props.projectId}
          selectedImageUrl={selectedImageUrl()}
          onSelectImage={handleSelectImage}
        />
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

  if (lastOccurrenceIndex === -1) {
    return text;
  }

  return `${text.slice(0, lastOccurrenceIndex)}${replaceValue}${text.slice(
    lastOccurrenceIndex + searchValue.length
  )}`;
}

function tryViewTransition(callback: () => void) {
  if (!document.startViewTransition) {
    callback();
    return;
  }

  document.startViewTransition(callback);
}
