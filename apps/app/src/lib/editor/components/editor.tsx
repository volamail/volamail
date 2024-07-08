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
import { EyeIcon, CodeIcon, SendIcon, UndoIcon } from "lucide-solid";

import { ImagePicker } from "./image-picker";
import { FloatingMenu } from "./floating-menu";
import { Button } from "~/lib/ui/components/button";
import { PasteHtmlButton } from "./paste-html-button";
import { showToast } from "~/lib/ui/components/toasts";
import { Textarea } from "~/lib/ui/components/textarea";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { generateTemplate } from "~/lib/templates/actions";
import { StartFromEmailDialog } from "./start-from-email-dialog";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

type Props = {
  name?: string;
  value?: string;
  projectId: string;
  onChange: (value: string | undefined) => void;
};

export function Editor(props: Props) {
  let mainForm!: HTMLFormElement;
  let templatePreview!: HTMLDivElement;
  let promptInput!: HTMLTextAreaElement;

  const [selectedElement, setSelectedElement] = createSignal<HTMLElement>();
  const [selectedImageUrl, setSelectedImageUrl] = createSignal<string>();
  const [prevValue, setPrevValue] = createSignal<string | null>(null);

  const generateTemplateAction = useMutation({
    action: generateTemplate,
    onSuccess(result) {
      mainForm.reset();

      setSelectedImageUrl();

      setPrevValue(props.value || null);

      props.onChange(result.code);
    },
    onError(e) {
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

    props.onChange(deserializeCode(templatePreview.innerHTML));

    setSelectedElement();
  }

  function deleteElement() {
    const element = selectedElement();

    if (!element) {
      return;
    }

    element.remove();

    props.onChange(deserializeCode(templatePreview.innerHTML));

    setSelectedElement();
  }

  function handleSelectImage(imageUrl?: string) {
    setSelectedImageUrl(imageUrl);

    promptInput.focus();
  }

  function handleUndo() {
    if (!prevValue()) {
      return;
    }

    props.onChange(prevValue() || undefined);

    setPrevValue(null);
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
          <div class="flex justify-between items-center">
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
            <Show when={prevValue()}>
              <Button
                type="button"
                variant="ghost"
                icon={() => <UndoIcon class="size-4" />}
                aria-label="Undo changes"
                class="p-2"
                onClick={handleUndo}
              />
            </Show>
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
                  onClose={() => setSelectedElement()}
                  onComplete={modifyElement}
                  onDelete={deleteElement}
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
        class="w-full max-w-2xl z-10"
        ref={mainForm}
      >
        <input type="hidden" name="projectId" value={props.projectId} />

        <Show when={props.value}>
          <input type="hidden" name="currentHtml" value={props.value} />
        </Show>

        <div class="flex flex-col gap-64">
          <Show when={!props.value}>
            <div class="flex flex-col gap-12">
              <div class="flex flex-col gap-2">
                <h1 class="text-4xl font-bold text-center">Create email</h1>
                <p class="text-center text-gray-600 text-sm">
                  Use an existing email as a starting point or start from
                  scratch.
                </p>
              </div>

              <div class="flex gap-4">
                <StartFromEmailDialog
                  projectId={props.projectId}
                  onComplete={(email) => props.onChange(email.body)}
                />

                <PasteHtmlButton onPaste={props.onChange} />
              </div>
            </div>
          </Show>

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
      </form>

      <input type="hidden" name={props.name} value={props.value} />
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
