import type { EditorState } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { type Editor, FloatingMenu as TiptapFloatingMenu } from "@tiptap/react";
import { ImageIcon, Rows2Icon, SeparatorHorizontalIcon } from "lucide-react";
import { BubbleMenuButton } from "./bubble-menu-button";
import { ImagePopover } from "./image-popover";

interface Props {
	editor: Editor;
}

export function FloatingMenu({ editor }: Props) {
	function shouldShow({
		state,
		view,
	}: { editor: Editor; state: EditorState; view: EditorView }) {
		const { selection } = state;
		const { $anchor, empty } = selection;
		const isEmptyTextBlock =
			$anchor.parent.isTextblock &&
			!$anchor.parent.type.spec.code &&
			!$anchor.parent.textContent;

		if (!view.hasFocus() || !empty || !isEmptyTextBlock || !editor.isEditable) {
			return false;
		}

		return true;
	}

	return (
		<TiptapFloatingMenu editor={editor} shouldShow={shouldShow}>
			<div className="relative flex min-w-0 items-center gap-1 rounded-lg p-1 opacity-50 shadow-lg transition-all hover:opacity-100 dark:bg-gray-900">
				<BubbleMenuButton
					aria-label="Create section"
					onClick={() => editor.chain().focus().setSection().run()}
				>
					<Rows2Icon className="size-4" />
				</BubbleMenuButton>

				<BubbleMenuButton
					aria-label="Add horizontal rule"
					onClick={() => editor.chain().focus().setHorizontalRule().run()}
				>
					<SeparatorHorizontalIcon className="size-4" />
				</BubbleMenuButton>

				<ImagePopover
					trigger={
						<BubbleMenuButton aria-label="Insert image">
							<ImageIcon className="size-4" />
						</BubbleMenuButton>
					}
					onSet={(url) => {
						editor.commands.insertContent({
							type: "image",
							attrs: { src: url },
						});
					}}
				/>
			</div>
		</TiptapFloatingMenu>
	);
}
