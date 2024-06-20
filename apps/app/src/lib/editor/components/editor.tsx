import {
  Show,
  onCleanup,
  createMemo,
  createEffect,
  createSignal,
} from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import { CodeIcon, EyeIcon, PaperclipIcon, SendIcon } from "lucide-solid";

import { FloatingMenu } from "./floating-menu";
import { Button } from "~/lib/ui/components/button";
import { Textarea } from "~/lib/ui/components/textarea";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { generateTemplate } from "~/lib/templates/actions";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

type Props = {
  name?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
};

export function Editor(props: Props) {
  let mainForm!: HTMLFormElement;
  let templatePreview!: HTMLDivElement;

  const [selectedElement, setSelectedElement] = createSignal<HTMLElement>();

  const generateTemplateAction = useMutation({
    action: generateTemplate,
    onSuccess(result) {
      mainForm.reset();

      props.onChange(result.code);
    },
    onError(error) {
      console.log(error);
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

  const displayedCode = createMemo(() => {
    const rawCode = props.value;

    if (!rawCode) {
      return;
    }

    return serializeCode(rawCode);
  });

  return (
    <GridBgContainer class="grow min-h-0 flex flex-col gap-2 justify-center items-center p-8">
      <Show when={props.value}>
        <Tabs class="grow min-h-0 flex flex-col gap-2 w-full relative">
          <Tabs.List class="border border-gray-300 inline-flex self-start text-sm items-center bg-gray-200 rounded-lg p-1">
            <Tabs.Trigger
              value="preview"
              class="rounded-lg inline-flex gap-1.5 items-center data-[selected]:bg-gray-100 px-3 py-1 data-[selected]:font-medium data-[selected]:text-black text-gray-600"
            >
              Preview
              <EyeIcon class="size-4" />
            </Tabs.Trigger>
            <Tabs.Trigger
              value="html"
              class="rounded-lg inline-flex gap-1.5 items-center data-[selected]:bg-gray-100 px-3 py-1 data-[selected]:font-medium data-[selected]:text-black text-gray-600"
            >
              HTML
              <CodeIcon class="size-4" />
            </Tabs.Trigger>
          </Tabs.List>
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
        class="w-full max-w-2xl"
        ref={mainForm}
      >
        <Show when={props.value}>
          <input type="hidden" name="currentHtml" value={props.value} />
        </Show>

        <Textarea
          name="prompt"
          required
          loading={generateTemplateAction.pending}
          resizeable
          submitOnEnter
          autofocus
          leading={() => (
            <Button
              icon={() => <PaperclipIcon class="size-4" />}
              as="label"
              variant="ghost"
              round
              even
              aria-label="Upload image"
            >
              <input
                type="file"
                name="image"
                accept="image/png, image/jpeg"
                class="sr-only"
                tabIndex={-1}
              />
            </Button>
          )}
          trailing={() => (
            <Button
              type="submit"
              aria-label="Request changes"
              class="p-2"
              round
              even
              icon={() => <SendIcon class="size-3" />}
            />
          )}
          class="py-1"
          placeholder="A welcome e-mail with a magic link button..."
        />
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
  return replaceLast(
    code.replaceAll(`data-selected="true"`, "").replace("<body", "<div"),
    "</body>",
    "</div>"
  );
}

function deserializeCode(code: string) {
  return replaceLast(
    code.replaceAll(`data-selected="true"`, "").replace("<div", "<body"),
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
