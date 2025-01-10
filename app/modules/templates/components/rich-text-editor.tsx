import { EditorContent, useEditor } from "@tiptap/react";
import { observer } from "mobx-react-lite";
import { getExtensionsFromTheme } from "../extensions";
import { useEditorStore } from "../store";
import { DEFAULT_THEME } from "../theme";
import { ImageBubbleMenu } from "./image-bubble-menu";
import { ImageResizer } from "./image-resizer";
import { SectionBubbleMenu } from "./section-bubble-menu";
import { TextBubbleMenu } from "./text-bubble-menu";

export const RichTextEditor = observer(() => {
	const extensions = getExtensionsFromTheme(DEFAULT_THEME);

	const store = useEditorStore();

	const editor = useEditor(
		{
			extensions,
			editorProps: {
				attributes: {
					class:
						"transition-all overflow-hidden [&_img:last-child]:mb-0 [&_img:first-child]:mt-0 [&>table:first-child] [&>table]:m-0 font-[Helvetica] font-[16px] outline-none prose rounded-[var(--content-border-radius)] max-w-[var(--content-max-width)] mx-auto bg-[var(--content-background)]",
				},
			},
			content:
				store.template.currentTranslation.contents ||
				"<table><tr><td><p>Start writing here...</p></td></tr></table>",
			onTransaction({ editor }) {
				store.template.currentTranslation.setContents(editor.getJSON());
			},
		},
		[store.template.currentLanguage],
	);

	return (
		<div className="relative min-h-0 grow">
			{editor && (
				<>
					<TextBubbleMenu editor={editor} />
					<ImageBubbleMenu editor={editor} />
					<SectionBubbleMenu editor={editor} />
				</>
			)}

			<EditorContent
				editor={editor}
				className="relative h-full overflow-y-auto p-16"
				id="editor-content"
				style={{
					background: store.theme.background,
					// @ts-expect-error: CSS variable
					"--content-background": store.theme.contentBackground,
					"--content-max-width": `${store.theme.contentMaxWidth}px`,
					"--content-border-radius": `${store.theme.contentBorderRadius}px`,
				}}
			>
				{editor && <ImageResizer editor={editor} />}
			</EditorContent>
		</div>
	);
});
