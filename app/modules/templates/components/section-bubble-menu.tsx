import { type Editor, BubbleMenu as TiptapBubbleMenu } from "@tiptap/react";
import { ExpandIcon, ShrinkIcon, Trash2Icon } from "lucide-react";
import { BubbleMenuButton } from "./bubble-menu-button";
import { ColorInput } from "./color-input";

interface Props {
	editor: Editor;
}

export function SectionBubbleMenu({ editor }: Props) {
	function shouldShow() {
		return editor.isActive("section");
	}

	function getReferenceClientRect() {
		const element = editor.state.selection.$anchor.start();

		const dom = editor.view.domAtPos(element - 1);

		return (dom.node as HTMLElement).getBoundingClientRect()!;
	}

	return (
		<TiptapBubbleMenu
			editor={editor}
			tippyOptions={{
				duration: 100,
				getReferenceClientRect,
				placement: "right",
			}}
			shouldShow={shouldShow}
		>
			<div className="relative flex min-h-0 flex-col items-center gap-1 rounded-lg p-1 opacity-50 shadow-lg transition-all hover:opacity-100 dark:bg-gray-900">
				<ColorInput
					showInput={false}
					key={editor.state.selection.anchor}
					defaultValue={editor.getAttributes("section").backgroundColor}
					onChange={(color) => editor.commands.setSectionBackgroundColor(color)}
					classes={{
						control: "p-0.5 border-0 dark:hover:bg-gray-800",
						valueSwatch: "p-2",
					}}
				/>

				<BubbleMenuButton
					aria-label="Delete section"
					onClick={() => editor.chain().focus().unsetSection().run()}
				>
					<Trash2Icon className="size-4" />
				</BubbleMenuButton>

				<BubbleMenuButton
					aria-label="Toggle section padding"
					onClick={() =>
						editor.getAttributes("section").padding === "0"
							? editor.commands.setSectionPadding("4em")
							: editor.commands.setSectionPadding("0")
					}
				>
					{editor.getAttributes("section").padding === "0" ? (
						<ExpandIcon className="size-4" />
					) : (
						<ShrinkIcon className="size-4" />
					)}
				</BubbleMenuButton>
			</div>
		</TiptapBubbleMenu>
	);
}
