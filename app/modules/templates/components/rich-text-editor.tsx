import { EditorContent, useEditor } from "@tiptap/react";
import { observer } from "mobx-react-lite";
import { getExtensionsFromTheme } from "../editor-extensions";
import { useEditorStore } from "../store";
import { DEFAULT_THEME } from "../theme";
import { Toolbar } from "./toolbar";

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
						"p-12 transition-all font-[Helvetica] font-[16px] outline-none prose rounded-[var(--content-border-radius)] max-w-[var(--content-max-width)] mx-auto bg-[var(--content-background)]",
				},
			},
			content: store.template.currentTranslation.contents,
			onTransaction({ editor }) {
				store.template.currentTranslation.setContents(editor.getJSON());
			},
		},
		[store.template.currentLanguage],
	);

	return (
		<div className="relative flex min-h-0 grow flex-col">
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
			{editor && <Toolbar editor={editor} />}
		</div>
	);
});
