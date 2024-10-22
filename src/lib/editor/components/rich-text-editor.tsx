import { type JSONContent, Editor as TipTapEditor } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { Show, createSignal } from "solid-js";
import { ViewportPreviewSwitch } from "~/lib/editor/components/viewport-preview-switch";
import type { Theme } from "~/lib/templates/theme";
import { Label } from "~/lib/ui/components/label";
import { getExtensionsFromTheme } from "../extensions";
import type { Viewport } from "../types";
import { Toolbar } from "./toolbar";

interface EditorProps {
	theme: Theme;
	projectId: string;
	defaultSubject?: string;
	defaultContents?: JSONContent;
	onChange?: (contents: JSONContent) => void;
}

export function RichTextEditor(props: EditorProps) {
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
				...getExtensionsFromTheme(props.theme),
				Placeholder.configure({ placeholder: "Write your email here..." }),
			],
			editorProps: {
				attributes: {
					class:
						"transition-all mx-auto rounded-[var(--editor-content-border-radius)] outline-none revert-tailwind max-w-[var(--editor-content-max-width)] w-full border border-gray-200 px-8 py-6 bg-[var(--editor-content-bg)]",
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
				name="template.contents"
				value={JSON.stringify(contents())}
			/>
			<div
				class="relative border rounded-2xl overflow-hidden transition-all flex flex-col justify-center text-sm grow z-10 w-full shadow-2xl shadow-gray-200"
				classList={{
					"max-w-5xl": viewport() === "desktop",
					"max-w-xl": viewport() === "tablet",
					"max-w-sm": viewport() === "mobile",
				}}
				style={{
					"background-color": props.theme.background,
					"--editor-content-bg": props.theme.contentBackground,
					"--editor-content-max-width": props.theme.contentMaxWidth,
					"--editor-content-border-radius": `${props.theme.contentBorderRadius}px`,
				}}
			>
				<div class="p-4 border-b border-gray-200 bg-gray-100 relative">
					<div class="flex gap-1 items-center">
						<Label for="subject">Subject:</Label>
						<input
							type="text"
							id="subject"
							name="template.subject"
							required
							placeholder="Welcome to Volamail"
							class="outline-none text-sm grow bg-transparent"
							{...(props.defaultSubject ? { value: props.defaultSubject } : {})}
						/>
					</div>
				</div>

				<div ref={handleEditorRef} class="grow p-8" />

				<Show when={editor()}>
					{(editor) => (
						<Toolbar editor={editor()} projectId={props.projectId} />
					)}
				</Show>
			</div>
			<ViewportPreviewSwitch value={viewport()} onChange={setViewport} />
		</div>
	);
}
