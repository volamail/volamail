import { Editor } from "@tiptap/core";
import { InfoIcon, TypeIcon } from "lucide-solid";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { debounce } from "@solid-primitives/scheduled";
import { createSignal, onMount, Show } from "solid-js";

import ColorPicker from "./color-picker";
import { Margin } from "../extensions/margin";
import { Padding } from "../extensions/padding";
import { FontSize } from "../extensions/font-size";
import { BackgroundColor } from "../extensions/background-color";
import { BorderRadius } from "../extensions/border-radius";

type Props = {
  defaultValue?: string;
  backgroundColor?: string;
};

export default function RichTextEditor(props: Props) {
  const [contents, setContents] = createSignal(props.defaultValue || "");

  const debouncedSetContents = debounce((newContents: string) => {
    setContents(newContents);
  }, 300);

  const [editor, setEditor] = createSignal<Editor | undefined>(undefined, {
    equals() {
      return false;
    },
  });

  onMount(() => {
    const editor = new Editor({
      element: document.getElementById("rich-editor")!,
      extensions: [
        StarterKit,
        TextStyle,
        Color.configure({
          types: ["textStyle", "heading", "paragraph", "link"],
        }),
        FontSize.configure({
          types: ["textStyle", "heading", "paragraph", "link"],
        }),
        Margin.configure({
          types: ["textStyle", "heading", "paragraph", "link"],
        }),
        BackgroundColor.configure({
          types: ["textStyle", "heading", "paragraph", "link"],
        }),
        Padding.configure({
          types: ["textStyle", "heading", "paragraph", "link"],
        }),
        BorderRadius.configure({
          types: ["textStyle", "heading", "paragraph", "link"],
        }),
        Link.configure({
          openOnClick: false,
          validate() {
            return true;
          },
        }),
        FontFamily.configure({
          types: ["textStyle", "heading", "paragraph", "link"],
        }),
      ],
      content: props.defaultValue,
      onUpdate({ editor }) {
        setEditor(editor);

        debouncedSetContents(editor.getHTML());
      },
      onTransaction({ editor }) {
        setEditor(editor);
      },
      onSelectionUpdate({ editor }) {
        setEditor(editor);
      },
    });

    setEditor(editor);
  });

  return (
    <div class="flex flex-col gap-1">
      <div class="flex flex-col border border-gray-200 rounded-lg">
        <div class="flex gap-2 border-b border-gray-200 p-1.5">
          <Show when={editor()}>
            {(editor) => (
              <ColorPicker
                icon={() => <TypeIcon class="size-4" />}
                aria-label="Change text color"
                value={editor().getAttributes("textStyle").color || ""}
                onChange={(value) => editor().chain().setColor(value).run()}
                name="textColor"
              />
            )}
          </Show>
        </div>
        <div
          id="rich-editor"
          class="revert-tailwind rounded-b-lg [&>div]:p-4 [&>div]:rounded-b-lg"
          style={{
            background: props.backgroundColor,
          }}
        />
        <input type="hidden" name="contents" value={contents()} />
      </div>
      <p class="text-xs text-gray-500 inline-flex items-center gap-1">
        <InfoIcon class="size-4" /> Rich text editing is still in alpha.
      </p>
    </div>
  );
}
