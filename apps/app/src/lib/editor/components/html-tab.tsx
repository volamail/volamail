import getWasm from "shiki/wasm";
import { LoaderIcon } from "lucide-solid";
import { createHighlighterCore } from "shiki/core";
import { createResource, Suspense } from "solid-js";

async function createCodeHighlight(code: string) {
  const highlighter = await createHighlighterCore({
    themes: [import("shiki/themes/min-light.mjs")],
    langs: [import("shiki/langs/html.mjs")],
    loadWasm: getWasm,
  });

  return highlighter.codeToHtml(code, {
    lang: "html",
    theme: "min-light",
  });
}

type Props = {
  code: string;
};

export function HtmlTab(props: Props) {
  const [code] = createResource(props.code, createCodeHighlight);

  return (
    <Suspense
      fallback={
        <div class="flex flex-col gap-2 justify-center items-center grow text-gray-500">
          <LoaderIcon class="size-6 animate-spin" />
          <p class="text-sm text-gray-500">Loading HTML preview...</p>
        </div>
      }
    >
      <div
        innerHTML={code()}
        class="contents [&>pre]:p-4 [&>pre]:text-sm [&>pre]:text-wrap"
      />
    </Suspense>
  );
}
