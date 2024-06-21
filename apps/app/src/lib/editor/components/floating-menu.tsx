import { JSX, Show, createMemo } from "solid-js";
import {
  LinkIcon,
  SendIcon,
  Trash2Icon,
  SaveAllIcon,
  ArrowUpNarrowWideIcon,
  TextIcon,
  CheckIcon,
} from "lucide-solid";

import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { Textarea } from "~/lib/ui/components/textarea";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { editTemplateElement } from "~/lib/templates/actions";
import { PopoverContent, PopoverRoot } from "~/lib/ui/components/popover";

type Props = {
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
  });

  const elementSettingsElements = createMemo(() => {
    const elements: Array<JSX.Element> = [];

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

    if (
      (props.element instanceof HTMLParagraphElement ||
        props.element instanceof HTMLHeadingElement ||
        props.element instanceof HTMLTableCellElement) &&
      elementHasOnlyText(props.element)
    ) {
      elements.push(
        <Textarea
          name="contents"
          leading={() => <TextIcon class="size-4" />}
          resizeable
        >
          {props.element.textContent || ""}
        </Textarea>
      );
    }

    return elements;
  });

  return (
    <PopoverRoot
      open
      onOpenChange={props.onClose}
      anchorRef={() => props.element}
    >
      <PopoverContent class="flex flex-col w-96">
        <>
          <form method="post" action={editTemplateElement} autocomplete="off">
            <input
              type="hidden"
              name="element"
              value={props.element.outerHTML}
            />
            <Input
              type="text"
              autofocus
              name="prompt"
              class="pr-1 gap-1"
              placeholder="Make this bold..."
              loading={action.pending}
              trailing={() => (
                <Button
                  type="submit"
                  variant="ghost"
                  icon={() => <SendIcon class="size-4" />}
                  round
                  even
                  aria-label="Request changes"
                />
              )}
            />
          </form>
          <div class="flex gap-1 w-full justify-start mt-1.5">
            <Button
              icon={() => <Trash2Icon class="size-4" />}
              color="destructive"
              onClick={props.onDelete}
              aria-label="Delete element"
              even
              variant="ghost"
            />
            <Button
              icon={() => <ArrowUpNarrowWideIcon class="size-4" />}
              variant="ghost"
              onClick={() =>
                props.onChangeSelection(props.element.parentElement!)
              }
              aria-label="Select parent element"
              even
            />
          </div>
          <Show when={elementSettingsElements().length}>
            <div class="flex flex-col gap-1">
              <div class="flex gap-2 items-center w-full">
                <hr class="grow border-gray-200" />
                <span class="text-sm font-medium text-gray-500">
                  Element settings (&lt;{props.element.tagName.toLowerCase()}
                  &gt;)
                </span>
                <hr class="grow border-gray-200" />
              </div>
              <form
                class="flex flex-col gap-2"
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

                  props.onComplete(element.outerHTML);
                }}
              >
                {elementSettingsElements()}
                <Button
                  type="submit"
                  icon={() => <SaveAllIcon class="size-4" />}
                  class="self-end"
                >
                  Save
                </Button>
              </form>
            </div>
          </Show>
        </>
      </PopoverContent>
    </PopoverRoot>
  );
}

function elementHasOnlyText(el: HTMLElement) {
  const pattern = /<.*>.*<\/.*>/;

  return !pattern.test(el.innerHTML);
}
