import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { createSignal, onMount, Show } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import HardBreak from "@tiptap/extension-hard-break";
import Link from "@tiptap/extension-link";
import { FontSize } from "../extensions/fontSize";
import { Margin } from "../extensions/margin";
import ColorPicker from "./color-picker";
import { TypeIcon } from "lucide-solid";
import { BackgroundColor } from "../extensions/backgroundColor";
import { Padding } from "../extensions/padding";

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
        HardBreak.extend({
          addKeyboardShortcuts() {
            return {
              Enter: () => {
                if (
                  this.editor.isActive("orderedList") ||
                  this.editor.isActive("bulletList")
                ) {
                  return this.editor.chain().createParagraphNear().run();
                }
                return this.editor.commands.setHardBreak();
              },
            };
          },
        }),
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
        HardBreak.configure({}),
        Link.configure({
          openOnClick: false,
          validate() {
            return true;
          },
        }),
      ],
      enableContentCheck: false,
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
  );
}
