import { Show, createSignal } from "solid-js";
import { ClipboardPasteIcon, LoaderIcon } from "lucide-solid";

import { cn } from "~/lib/ui/utils/cn";
import { showToast } from "~/lib/ui/components/toasts";

type Props = {
  onPaste: (contents: string) => void;
};

export function PasteHtmlButton(props: Props) {
  const [pending, setPending] = createSignal(false);

  async function handlePaste() {
    setPending(true);

    try {
      const contents = await navigator.clipboard.readText();

      if (!contents.startsWith("<body")) {
        showToast({
          title: "Clipboard text isn't valid HTML",
          variant: "error",
        });

        return;
      }

      props.onPaste(contents);
    } catch (e) {
      showToast({
        title: "Couldn't read clipboard",
        variant: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      class={cn(
        "cursor-default flex-1 rounded-lg bg-gray-200 shadow p-4 text-sm inline-flex flex-col gap-2 items-start transition-colors",
        pending() && "bg-black text-white",
        !pending() && "hover:bg-gray-300"
      )}
      onClick={handlePaste}
    >
      <ClipboardPasteIcon
        class={cn(
          "size-8 bg-black text-white rounded-lg p-2 shrink-0",
          pending() && "bg-white text-black"
        )}
      />

      <div class="flex flex-col items-start text-left mt-1 gap-1">
        <Show
          when={pending()}
          fallback={
            <>
              <p class="font-medium">Paste HTML</p>
              <p class="text-xs text-gray-600">
                Make sure to only include the &lt;body&gt; tag of the HTML
              </p>
            </>
          }
        >
          <div class="flex gap-1 items-center">
            <p class="font-medium">Waiting for permissions...</p>
            <LoaderIcon class="size-4 animate-spin" />
          </div>
          <p class="text-xs text-gray-400">
            Please allow permissions to access your clipboard
          </p>
        </Show>
      </div>
    </button>
  );
}
