import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react";
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";
import { BubbleMenuButton } from "./bubble-menu-button";

interface Props {
	editor: Editor;
}

export function ImageBubbleMenu({ editor }: Props) {
	function shouldShow({ editor }: { editor: Editor }) {
		return editor.isActive("image");
	}

	return (
		<TiptapBubbleMenu
			editor={editor}
			updateDelay={0}
			shouldShow={shouldShow}
			tippyOptions={{
				offset: [0, 4],
				hideOnClick: true,
				placement: "bottom",
				popperOptions: {
					strategy: "fixed",
				},
			}}
		>
			<div className="relative flex items-center gap-1 overflow-hidden rounded-lg p-1 shadow-lg transition-all dark:bg-gray-900">
				<BubbleMenuButton
					aria-label="Set align left"
					onClick={() => editor.commands.setImageAlign("left")}
					active={editor.isActive({ align: "left" })}
				>
					<AlignLeftIcon className="size-4" />
				</BubbleMenuButton>
				<BubbleMenuButton
					aria-label="Set align center"
					onClick={() => editor.commands.setImageAlign("center")}
					active={editor.isActive({ align: "center" })}
				>
					<AlignCenterIcon className="size-4" />
				</BubbleMenuButton>
				<BubbleMenuButton
					aria-label="Set align right"
					onClick={() => editor.commands.setImageAlign("right")}
					active={editor.isActive({ align: "right" })}
				>
					<AlignRightIcon className="size-4" />
				</BubbleMenuButton>
			</div>
		</TiptapBubbleMenu>
	);
}
