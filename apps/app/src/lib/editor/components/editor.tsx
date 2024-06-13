import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import { PaperclipIcon, SendIcon } from "lucide-solid";

import { FloatingMenu } from "./floating-menu";
import { Button } from "~/lib/ui/components/button";
import { Textarea } from "~/lib/ui/components/textarea";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { generateTemplate } from "~/lib/templates/actions";

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
    <div class="grow flex flex-col gap-2 justify-center items-center p-16 relative">
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
          placeholder="A welcome e-mail using a magic link button..."
        />
      </form>

      <Show when={props.value}>
        <div class="relative overflow-y-auto bg-white border border-gray-200 w-full rounded-xl shadow">
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
              />
            )}
          </Show>
        </div>
      </Show>

      <input type="hidden" name={props.name} value={props.value} />
    </div>
  );
}

/**
 * These two functions are needed to make
 * email HTML displayable in the browser and,
 * viceversa, to convert the code displayed
 * in the editor back to email-valid HTML.
 */

function serializeCode(code: string) {
  return code.replace("<body", "<div").replace("</body>", "</div>");
}

function deserializeCode(code: string) {
  return code.replace("<div", "<body").replace("</div>", "</body>");
}
