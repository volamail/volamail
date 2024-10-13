import { createSignal } from "solid-js";
import { ViewportPreviewSwitch } from "~/lib/editor/components/viewport-preview-switch";
import { Editor as TipTapEditor, type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { Viewport } from "../types";

interface EditorProps {
	defaultContents?: JSONContent;
	name: string;
	onChange?: (contents: JSONContent) => void;
}

export function Editor(props: EditorProps) {
	const [contents, setContents] = createSignal(props.defaultContents);

	const [editor, setEditor] = createSignal<TipTapEditor | null>(null, {
		equals: false,
	});

	const [viewport, setViewport] = createSignal<Viewport>("desktop");

	function handleChange(contents: JSONContent) {
		setContents(contents);

		if (props.onChange) {
			props.onChange(contents);
		}
	}

	function handleEditorRef(element: HTMLDivElement) {
		if (editor()) {
			return;
		}

		const instance = new TipTapEditor({
			element,
			extensions: [
				StarterKit,
				Placeholder.configure({ placeholder: "Write your email here..." }),
			],
			editorProps: {
				attributes: {
					class:
						"outline-none revert-tailwind max-w-2xl w-full border border-gray-200 px-8 py-6 bg-white",
				},
			},
			onUpdate({ editor }) {
				handleChange(editor.getJSON());
			},
			onTransaction({ editor }) {
				setEditor(editor);
			},
			content: props.defaultContents,
		});

		setEditor(instance);
	}

	return (
		<div class="grow p-16 flex flex-col justify-center items-center gap-4">
			<input
				type="hidden"
				name={props.name}
				value={JSON.stringify(contents())}
			/>
			<div
				ref={handleEditorRef}
				class="border-8 rounded-2xl transition-all flex justify-center items-start bg-gray-100 p-8 text-sm grow z-10 w-full shadow-2xl shadow-gray-200"
				classList={{
					"max-w-5xl": viewport() === "desktop",
					"max-w-xl": viewport() === "tablet",
					"max-w-sm": viewport() === "mobile",
				}}
			/>
			<ViewportPreviewSwitch value={viewport()} onChange={setViewport} />
		</div>
	);
}
