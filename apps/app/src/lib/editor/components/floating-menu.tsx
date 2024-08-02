import {
  LinkIcon,
  Trash2Icon,
  SparklesIcon,
  PaintBucketIcon,
  CircleCheckBigIcon,
  ArrowUpNarrowWideIcon,
} from "lucide-solid";
import { JSX, Show, createMemo, createSignal } from "solid-js";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/lib/ui/components/tooltip";
import ColorPicker from "./color-picker";
import RichTextEditor from "./rich-text-editor";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { editTemplateElement } from "~/lib/templates/actions";
import { PopoverContent, PopoverRoot } from "~/lib/ui/components/popover";

type Props = {
  projectId: string;
  element: HTMLElement;
  onClose: () => void;
  onComplete: (changes: string) => void;
  onChangeSelection: (element: HTMLElement) => void;
  onDelete: () => void;
  onEdit: (changes: string) => void;
};

export function FloatingMenu(props: Props) {
  const action = useMutation({
    action: editTemplateElement,
    onSuccess(result) {
      props.element.outerHTML = result.code;

      props.onComplete(result.code);
    },
    onError(e) {
      showToast({
        title: e.statusMessage || "Unable to edit element",
        variant: "error",
      });
    },
  });

  const [inlineChangePending, setInlineChangePending] = createSignal(false);

  function handleBackgroundColorChange(value: string) {
    props.element.style.backgroundColor = value;

    setInlineChangePending(true);
  }

  const backgroundColor = createMemo(
    () =>
      props.element.computedStyleMap().get("background-color")?.toString() ||
      "transparent"
  );

  const elementSettingsElements = createMemo(() => {
    const elements: Array<JSX.Element> = [];

    if (
      props.element instanceof HTMLParagraphElement ||
      props.element instanceof HTMLHeadingElement ||
      props.element instanceof HTMLAnchorElement
    ) {
      const contents = props.element.outerHTML;

      elements.push(
        <RichTextEditor
          defaultValue={contents}
          backgroundColor={getComputedElementBackground(
            props.element.parentElement!
          )}
        />
      );
    }

    if (props.element instanceof HTMLAnchorElement) {
      elements.push(
        <Input
          type="text"
          name="href"
          leading={() => <LinkIcon class="size-4" />}
          value={props.element.href}
        />
      );
    }

    if (props.element instanceof HTMLImageElement) {
      elements.push(
        <Input
          type="text"
          name="src"
          leading={() => <LinkIcon class="size-4" />}
          value={props.element.src}
        />
      );
    }

    return elements;
  });

  function handleClose() {
    if (inlineChangePending()) {
      props.onEdit(props.element.outerHTML);
    }

    props.onClose();
  }

  return (
    <PopoverRoot
      open
      onOpenChange={handleClose}
      anchorRef={() => props.element}
      placement="left"
    >
      <PopoverContent class="flex flex-col w-[30rem]">
        <>
          <form
            method="post"
            class="w-full"
            action={editTemplateElement}
            autocomplete="off"
          >
            <input type="hidden" name="projectId" value={props.projectId} />

            <input
              type="hidden"
              name="element"
              value={props.element.outerHTML}
            />

            <Input
              type="text"
              autofocus
              name="prompt"
              class="gap-1 w-full"
              placeholder="Make this bold..."
              loading={action.pending}
              trailing={() => (
                <Button
                  type="submit"
                  icon={() => <SparklesIcon class="size-3" />}
                  round
                  even
                  class="p-1.5"
                  aria-label="Request changes"
                />
              )}
            />
          </form>

          <form
            onSubmit={(e) => {
              e.preventDefault();

              const element = props.element as HTMLElement;

              const formData = new FormData(e.target as HTMLFormElement);

              element.removeAttribute("data-selected");

              if (formData.get("src")) {
                (element as HTMLImageElement).src = formData.get(
                  "src"
                ) as string;
              }

              if (formData.get("href")) {
                (element as HTMLAnchorElement).href = formData.get(
                  "href"
                ) as string;
              }

              if (formData.get("contents")) {
                element.outerHTML = formData.get("contents") as string;
              }

              if (formData.get("textColor")) {
                element.style.color = formData.get("textColor") as string;
              }

              if (formData.get("backgroundColor")) {
                element.style.backgroundColor = formData.get(
                  "backgroundColor"
                ) as string;
              }

              props.onComplete(element.outerHTML);
            }}
            autocomplete="off"
          >
            <div class="flex gap-1 w-full justify-between mt-1.5">
              <div class="flex gap-1 items-center">
                <Show
                  when={
                    props.element instanceof HTMLParagraphElement ||
                    props.element instanceof HTMLHeadingElement ||
                    props.element instanceof HTMLAnchorElement ||
                    props.element instanceof HTMLTableCellElement
                  }
                >
                  <ColorPicker
                    icon={() => <PaintBucketIcon class="size-4" />}
                    aria-label="Change background color"
                    value={backgroundColor()}
                    onChange={handleBackgroundColorChange}
                    name="backgroundColor"
                  />
                </Show>
              </div>

              <div class="flex gap-1 items-center">
                <Tooltip>
                  <TooltipTrigger
                    as={Button}
                    icon={() => <ArrowUpNarrowWideIcon class="size-4" />}
                    variant="outline"
                    onClick={() =>
                      props.onChangeSelection(props.element.parentElement!)
                    }
                    aria-label="Select parent element"
                    even
                  />
                  <TooltipContent>Select parent element</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    as={Button}
                    icon={() => <Trash2Icon class="size-4" />}
                    color="destructive"
                    onClick={props.onDelete}
                    aria-label="Delete element"
                    even
                    variant="outline"
                  />
                  <TooltipContent>Delete element</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Show when={elementSettingsElements().length}>
              <div class="flex flex-col gap-1">
                <div class="flex gap-2 items-center w-full">
                  <hr class="grow border-gray-200" />
                  <span class="text-sm font-medium text-gray-500">
                    &lt;{props.element.tagName.toLowerCase()}
                    &gt; settings
                  </span>
                  <hr class="grow border-gray-200" />
                </div>
                <div class="flex flex-col gap-2">
                  {elementSettingsElements()}
                  <Button
                    type="submit"
                    icon={() => <CircleCheckBigIcon class="size-4" />}
                    class="self-end"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </Show>
          </form>
        </>
      </PopoverContent>
    </PopoverRoot>
  );
}

function getComputedElementBackground(element: HTMLElement) {
  const computedBackgrond = window.getComputedStyle(element).backgroundColor;

  if (computedBackgrond !== "rgba(0, 0, 0, 0)") {
    return computedBackgrond;
  }

  return getComputedElementBackground(element.parentElement!);
}
