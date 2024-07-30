import getWasm from "shiki/wasm";
import { createResource } from "solid-js";
import { createHighlighterCore } from "shiki/core";

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

export default function HtmlTab(props: Props) {
  const [code] = createResource(props.code, createCodeHighlight);

  return (
    <div
      innerHTML={code()}
      class="contents [&>pre]:p-4 [&>pre]:text-sm [&>pre]:text-wrap"
    />
  );
}
