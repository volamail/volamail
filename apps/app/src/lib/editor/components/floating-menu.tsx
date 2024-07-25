import { JSX, Show, createMemo } from "solid-js";
import {
  LinkIcon,
  Trash2Icon,
  ArrowUpNarrowWideIcon,
  TextIcon,
  CircleCheckBigIcon,
  SparklesIcon,
  TypeIcon,
  PaintBucketIcon,
} from "lucide-solid";

import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { Textarea } from "~/lib/ui/components/textarea";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { editTemplateElement } from "~/lib/templates/actions";
import { PopoverContent, PopoverRoot } from "~/lib/ui/components/popover";
import ColorPicker from "./color-picker";

type Props = {
  projectId: string;
  element: HTMLElement;
  onClose: () => void;
  onComplete: (changes: string) => void;
  onChangeSelection: (element: HTMLElement) => void;
  onDelete: () => void;
};

export function FloatingMenu(props: Props) {
  const action = useMutation({
    action: editTemplateElement,
    onSuccess(result) {
      props.onComplete(result.code);
    },
    onError(e) {
      showToast({
        title: "Unable to edit element",
        variant: "error",
      });
    },
  });

  const elementSettingsElements = createMemo(() => {
    const elements: Array<JSX.Element> = [];

    if (
      (props.element instanceof HTMLParagraphElement ||
        props.element instanceof HTMLHeadingElement ||
        props.element instanceof HTMLTableCellElement ||
        props.element instanceof HTMLAnchorElement) &&
      elementHasOnlyText(props.element)
    ) {
      const contents = (props.element.textContent || "").trim();

      elements.push(
        <Textarea
          name="contents"
          leading={() => <TextIcon class="size-4" />}
          resizeable
        >
          {contents}
        </Textarea>
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

  const color =
    props.element.computedStyleMap().get("color")?.toString() || "#000000";

  const backgroundColor =
    props.element.computedStyleMap().get("background-color")?.toString() ||
    "transparent";

  return (
    <PopoverRoot
      open
      onOpenChange={props.onClose}
      anchorRef={() => props.element}
    >
      <PopoverContent class="flex flex-col w-96">
        <>
          <form method="post" action={editTemplateElement} autocomplete="off">
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
              class="pr-2 gap-1"
              placeholder="Make this bold..."
              loading={action.pending}
              trailing={() => (
                <Button
                  type="submit"
                  variant="ghost"
                  icon={() => <SparklesIcon class="size-4" />}
                  round
                  even
                  class="p-1"
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
                element.textContent = formData.get("contents") as string;
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
                    icon={() => <TypeIcon class="size-4" />}
                    aria-label="Change text color"
                    value={color}
                    name="textColor"
                  />
                  <ColorPicker
                    icon={() => <PaintBucketIcon class="size-4" />}
                    aria-label="Change background color"
                    value={backgroundColor}
                    name="backgroundColor"
                  />
                </Show>
              </div>

              <div class="flex gap-1 items-center">
                <Button
                  icon={() => <ArrowUpNarrowWideIcon class="size-4" />}
                  variant="outline"
                  onClick={() =>
                    props.onChangeSelection(props.element.parentElement!)
                  }
                  aria-label="Select parent element"
                  even
                />
                <Button
                  icon={() => <Trash2Icon class="size-4" />}
                  color="destructive"
                  onClick={props.onDelete}
                  aria-label="Delete element"
                  even
                  variant="outline"
                />
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

function elementHasOnlyText(el: HTMLElement) {
  const pattern = /<.*>.*<\/.*>/;

  return !pattern.test(el.innerHTML);
}
