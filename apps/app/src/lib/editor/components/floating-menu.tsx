import { Show, createMemo } from "solid-js";
import { LinkIcon, SendIcon, Trash2Icon, SaveAllIcon } from "lucide-solid";

import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { editTemplateElement } from "~/lib/templates/actions";
import { PopoverContent, PopoverRoot } from "~/lib/ui/components/popover";

type Props = {
  element: HTMLElement;
  onClose: () => void;
  onComplete: (changes: string) => void;
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

            props.onComplete(element.outerHTML);
          }}
        >
          <Input
            type="text"
            name="href"
            leading={() => <LinkIcon class="size-4" />}
            value={props.element.href}
          />
          <Button type="submit" icon={() => <SaveAllIcon class="size-4" />}>
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

            props.onComplete(element.outerHTML);
          }}
        >
          <Input
            type="text"
            name="src"
            leading={() => <LinkIcon class="size-4" />}
            value={props.element.src}
          />
          <Button type="submit" icon={() => <SaveAllIcon class="size-4" />}>
            Save
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
      <PopoverContent class="flex flex-col gap-2">
        <>
          <form method="post" action={editTemplateElement}>
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
          <Show when={content()}>
            <hr />
            {content()}
          </Show>
          <Button
            icon={() => <Trash2Icon class="size-4" />}
            color="destructive"
            onClick={props.onDelete}
          >
            Delete
          </Button>
        </>
      </PopoverContent>
    </PopoverRoot>
  );
}
