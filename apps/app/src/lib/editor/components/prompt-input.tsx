import {
  Show,
  onMount,
  onCleanup,
  createMemo,
  createEffect,
  createSignal,
} from "solid-js";
import { SparklesIcon } from "lucide-solid";
import { createQuery } from "@tanstack/solid-query";
import { debounce } from "@solid-primitives/scheduled";

import { ImagePicker } from "./image-picker";
import { Button } from "~/lib/ui/components/button";
import { AiContextPopover } from "./ai-context-popover";
import { getTemplateGenerationAutocomplete } from "~/lib/templates/queries";

type Props = {
  loading?: boolean;
  project: {
    id: string;
    context?: string | null;
  };
  selectedImageUrl?: string;
  onSelectImage: (imageUrl?: string) => void;
  ref?: HTMLDivElement;
  placeholder?: string;
};

export function PromptInput(props: Props) {
  const [contents, setContents] = createSignal("");
  const [aiContext, setAiContext] = createSignal(props.project.context);
  const [debouncedContents, setDebouncedContents] = createSignal(contents());

  const query = createQuery(() => ({
    queryKey: ["template-autocomplete", debouncedContents()],
    queryFn: () =>
      getTemplateGenerationAutocomplete({
        query: debouncedContents(),
        projectId: props.project.id,
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

  function handleContentEditableRef(element: HTMLDivElement) {
    contentEditableRef = element;

    // is this illegal? idk
    props.ref = element;

    if (props.loading === false) {
      element.focus();

      element.innerText = "";

      setContents("");
    } else if (props.loading === true) {
      element.blur();
    }
  }

  createEffect((prev: boolean | undefined) => {
    if (props.loading === false && prev === true) {
      contentEditableRef!.focus();

      contentEditableRef!.innerText = "";

      setContents("");
    } else if (props.loading === true) {
      contentEditableRef.blur();
    }

    return props.loading;
  });

  const suggestion = createMemo(() => {
    return query.isLoading ||
      props.loading ||
      contents() !== debouncedContents() ||
      (query?.data && contents().includes(query.data))
      ? ""
      : query?.data ||
          props.placeholder ||
          "A welcome e-mail with a magic link button...";
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
    if (event.key === "Enter" && event.currentTarget === contentEditableRef) {
      event.preventDefault();

      const form = hiddenInputRef.form;

      form?.requestSubmit();
    }
  }

  return (
    <div class='flex relative gap-1 has-[div:focus]:outline bg-white has-[div[aria-disabled="true"]]:bg-gray-200 outline-blue-500 items-center w-full rounded-lg border border-gray-300 px-2 py-1'>
      <div class="flex gap-1 shrink-0 items-center py-1">
        <AiContextPopover
          projectId={props.project.id}
          defaultContext={props.project.context}
          onChange={setAiContext}
        />

        <div class="h-6 w-[1px] bg-gray-300" />

        <ImagePicker
          projectId={props.project.id}
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
        aria-disabled={props.loading}
        ref={handleContentEditableRef}
        class="py-1 gap-1 grow text-sm outline-none after:content-[attr(data-suggestion)] after:text-gray-400"
        data-suggestion={suggestion()}
        onInput={(e) => {
          const text = e.currentTarget.innerText;

          setContents(text);
          setDebouncedValue(text);
        }}
      />

      <Show when={aiContext()}>
        {(context) => <input type="hidden" name="context" value={context()} />}
      </Show>

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
        disabled={!contents()}
        loading={props.loading}
        icon={() => <SparklesIcon class="size-4" />}
      />
    </div>
  );
}

export function PromptInputSkeleton() {
  return <div class="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />;
}
