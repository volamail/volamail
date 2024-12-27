import { EditorContent, useEditor } from "@tiptap/react";
import { observer } from "mobx-react-lite";
import { getExtensionsFromTheme } from "../extensions";
import { useEditorStore } from "../store";
import { DEFAULT_THEME } from "../theme";
import { FloatingMenu } from "./floating-menu";
import { ImageBubbleMenu } from "./image-bubble-menu";
import { TextBubbleMenu } from "./text-bubble-menu";

export const RichTextEditor = observer(() => {
	const extensions = getExtensionsFromTheme(DEFAULT_THEME);

	const store = useEditorStore();

	const editor = useEditor(
		{
			immediatelyRender: false,
			extensions,
			editorProps: {
				attributes: {
					class:
						"transition-all overflow-hidden [&>table]:m-0 [&>small]:text-gray-400 font-[Helvetica] font-[16px] outline-none prose rounded-[var(--content-border-radius)] max-w-[var(--content-max-width)] mx-auto bg-[var(--content-background)]",
				},
			},
			content:
				store.template.currentTranslation.contents ||
				"<table><tr><td><p>Zio pera</p></td></tr></table>",
			onTransaction({ editor }) {
				store.template.currentTranslation.setContents(editor.getJSON());
			},
		},
		[store.template.currentLanguage],
	);

	return (
		<div className="relative flex min-h-0 grow flex-col">
			{editor && <TextBubbleMenu editor={editor} />}
			{editor && <ImageBubbleMenu editor={editor} />}
			{editor && <FloatingMenu editor={editor} />}
			<EditorContent
				editor={editor}
				className="relative min-h-0 grow overflow-y-auto p-16"
				style={{
					background: store.theme.background,
					// @ts-expect-error: CSS variable
					"--content-background": store.theme.contentBackground,
					"--content-max-width": `${store.theme.contentMaxWidth}px`,
					"--content-border-radius": `${store.theme.contentBorderRadius}px`,
				}}
			/>
		</div>
	);
});
