import { EditorContent, useEditor } from "@tiptap/react";
import { observer } from "mobx-react-lite";
import { getExtensionsFromTheme } from "../extensions";
import { SlashMenu } from "../extensions/slash-menu";
import { useEditorStore } from "../store";
import editorCss from "../template-styles.css?raw";
import { DEFAULT_THEME, getEditorStyleVariables } from "../theme";
import { ImageBubbleMenu } from "./image-bubble-menu";
import { ImageResizer } from "./image-resizer";
import { SectionBubbleMenu } from "./section-bubble-menu";
import { TextBubbleMenu } from "./text-bubble-menu";

export const RichTextEditor = observer(() => {
	const extensions = getExtensionsFromTheme(DEFAULT_THEME);

	const store = useEditorStore();

	const editor = useEditor(
		{
			extensions: [...extensions, SlashMenu],
			editorProps: {
				attributes: {
					class: "transition-all overflow-hidden mx-auto content",
				},
			},
			content:
				store.template.currentTranslation.contents ||
				"<table><tr><td><p> </p></td></tr></table>",
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

			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: fuck off */}
			<style dangerouslySetInnerHTML={{ __html: editorCss }} />

			<EditorContent
				editor={editor}
				className="root relative h-full overflow-y-auto p-16"
				id="editor-content"
				style={getEditorStyleVariables(store.theme)}
			>
				{editor && <ImageResizer editor={editor} />}
			</EditorContent>
		</div>
	);
});
