import { EditorContent, useEditor } from "@tiptap/react";
import { observer } from "mobx-react-lite";
import { getExtensionsFromTheme } from "../extensions";
import { SlashMenu } from "../extensions/slash-menu";
import { useEditorStore } from "../store";
import {
	DEFAULT_THEME,
	EDITOR_STYLE_VARIABLES,
	getEditorContainerStyle,
} from "../theme";
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
					class:
						"transition-all overflow-hidden [&_img:last-child]:mb-0 [&_img:first-child]:mt-0 [&>table:first-child] [&>table]:m-0 font-[Helvetica] font-[16px] outline-none prose mx-auto bg-white",
					style: EDITOR_STYLE_VARIABLES,
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

			<EditorContent
				editor={editor}
				className="relative h-full overflow-y-auto p-16"
				id="editor-content"
				style={getEditorContainerStyle(store.theme)}
			>
				{editor && <ImageResizer editor={editor} />}
			</EditorContent>
		</div>
	);
});
