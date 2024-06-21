import { Show, createSignal } from "solid-js";
import { ClipboardPasteIcon, LoaderIcon } from "lucide-solid";

import { cn } from "~/lib/ui/utils/cn";

type Props = {
  onPaste: (contents: string) => void;
};

export function PasteHtmlButton(props: Props) {
  const [selected, setSelected] = createSignal(false);

  return (
    <button
      type="button"
      class={cn(
        "font-medium cursor-default flex-1 rounded-lg bg-gray-200 shadow p-4 text-sm inline-flex gap-2 items-center transition-colors",
        selected() && "bg-black text-white",
        !selected() && "hover:bg-gray-300"
      )}
      onFocusIn={() => {
        setSelected(true);
      }}
      onBlur={() => setSelected(false)}
      onPointerDown={(e) => {
        if (selected() && e.target === document.activeElement) {
          e.preventDefault();
          (e.target as HTMLButtonElement).blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();

        props.onPaste(e.clipboardData?.getData("text") ?? "");
      }}
    >
      <ClipboardPasteIcon
        class={cn(
          "size-8 bg-black text-white rounded-lg p-2",
          selected() && "bg-white text-black"
        )}
      />
      <Show when={selected()} fallback="Paste HTML">
        Waiting for paste...
        <LoaderIcon class="size-4 animate-spin" />
      </Show>
    </button>
  );
}
