import { SparklesIcon } from "lucide-solid";
import { createQuery } from "@tanstack/solid-query";
import { debounce } from "@solid-primitives/scheduled";
import { createSignal, onCleanup, onMount, Show } from "solid-js";

import { ImagePicker } from "./image-picker";
import { Button } from "~/lib/ui/components/button";
import { getTemplateGenerationAutocomplete } from "~/lib/templates/queries";

type Props = {
  loading?: boolean;
  projectId: string;
  selectedImageUrl?: string;
  onSelectImage: (imageUrl?: string) => void;
  ref?: HTMLDivElement;
};

export function PromptInput(props: Props) {
  const [contents, setContents] = createSignal("");
  const [debouncedContents, setDebouncedContents] = createSignal(contents());

  const query = createQuery(() => ({
    queryKey: ["template-autocomplete", debouncedContents()],
    queryFn: () =>
      getTemplateGenerationAutocomplete({
        query: debouncedContents(),
        projectId: props.projectId,
      }),
    enabled: debouncedContents().length > 2,
  }));

  const setDebouncedValue = debounce((contents: string) => {
    setDebouncedContents(contents);
  }, 300);

  let contentEditableRef!: HTMLDivElement;
  let hiddenInputRef!: HTMLInputElement;

  onMount(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);

    onCleanup(() => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    });
  });

  function handleGlobalKeyDown(event: KeyboardEvent) {
    if (
      event.key === "Tab" &&
      event.target === contentEditableRef &&
      query?.data
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (contentEditableRef) {
        const contents = `${contentEditableRef.textContent}${
          query?.data || ""
        }`;

        contentEditableRef.innerText = contents;
        contentEditableRef.focus();

        const range = document.createRange();

        range.selectNodeContents(contentEditableRef);
        range.collapse(false);

        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);

        setContents(contents);
      }
    }
  }

  function handleInputKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();

      const form = hiddenInputRef.form;

      form?.requestSubmit();
    }
  }

  return (
    <div class="flex gap-1 has-[div:focus]:outline outline-blue-500 items-center w-full bg-white rounded-lg border border-gray-300 px-2 py-1">
      <div class="flex gap-1 shrink-0 items-center py-1">
        <ImagePicker
          projectId={props.projectId}
          onSelect={props.onSelectImage}
        />
        <Show when={props.selectedImageUrl}>
          <span class="text-gray-500 text-sm">Using this image,</span>
          <input type="hidden" name="image" value={props.selectedImageUrl} />
        </Show>
      </div>

      <div
        contentEditable={!props.loading}
        onKeyDown={handleInputKeyDown}
        tabIndex={0}
        ref={(el) => {
          contentEditableRef = el;
          props.ref = el;
        }}
        class="py-1 gap-1 grow text-sm outline-none after:content-[attr(data-suggestion)] after:text-gray-400"
        data-suggestion={
          query.isLoading ||
          contents() !== debouncedContents() ||
          (query?.data && contents().includes(query.data))
            ? ""
            : query?.data || "A welcome e-mail with a magic link button..."
        }
        onInput={(e) => {
          const text = e.currentTarget.innerText;

          setContents(text);
          setDebouncedValue(text);
        }}
      />

      <input
        type="hidden"
        name="prompt"
        ref={hiddenInputRef}
        value={contents()}
      />

      <Button
        type="submit"
        aria-label="Request changes"
        class="p-1.5 mt-0.5"
        round
        even
        loading={props.loading}
        icon={() => <SparklesIcon class="size-4" />}
      />
    </div>
  );
}
