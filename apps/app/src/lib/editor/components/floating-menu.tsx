import { Show, createMemo } from "solid-js";
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

  const content = createMemo(() => {
    if (props.element instanceof HTMLAnchorElement) {
      return (
        <form
          class="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();

            const element = props.element as HTMLAnchorElement;

            const formData = new FormData(e.target as HTMLFormElement);

            element.href = formData.get("href") as string;

            element.removeAttribute("data-selected");

            props.onComplete(element.outerHTML);
          }}
        >
          <Input
            type="text"
            name="href"
            leading={() => <LinkIcon class="size-4" />}
            value={props.element.href}
          />
          <Button
            type="submit"
            icon={() => <SaveAllIcon class="size-4" />}
            class="self-end"
          >
            Save
          </Button>
        </form>
      );
    }

    if (props.element instanceof HTMLImageElement) {
      return (
        <form
          class="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();

            const element = props.element as HTMLImageElement;

            const formData = new FormData(e.target as HTMLFormElement);

            element.src = formData.get("src") as string;

            element.removeAttribute("data-selected");

            props.onComplete(element.outerHTML);
          }}
        >
          <Input
            type="text"
            name="src"
            leading={() => <LinkIcon class="size-4" />}
            value={props.element.src}
          />
          <Button
            type="submit"
            icon={() => <SaveAllIcon class="size-4" />}
            class="self-end"
          >
            Save
          </Button>
        </form>
      );
    }

    if (
      props.element instanceof HTMLParagraphElement ||
      props.element instanceof HTMLHeadingElement
    ) {
      return (
        <form
          class="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();

            const element = props.element as HTMLParagraphElement;

            const formData = new FormData(e.target as HTMLFormElement);

            element.textContent = formData.get("contents") as string;

            element.removeAttribute("data-selected");

            props.onComplete(element.outerHTML);
          }}
        >
          <Textarea
            name="contents"
            resizeable
            leading={() => <TextIcon class="size-4" />}
          >
            {props.element.textContent}
          </Textarea>
          <Button
            type="submit"
            icon={() => <CheckIcon class="size-4" />}
            class="self-end"
          >
            Apply
          </Button>
        </form>
      );
    }
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
          <Show when={content()}>
            <div class="flex flex-col gap-1">
              <div class="flex gap-2 items-center w-full">
                <hr class="grow border-gray-200" />
                <span class="text-sm font-medium text-gray-500">
                  Element settings
                </span>
                <hr class="grow border-gray-200" />
              </div>
              {content()}
            </div>
          </Show>
        </>
      </PopoverContent>
    </PopoverRoot>
  );
}
