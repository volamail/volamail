import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react";
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";
import Moveable from "react-moveable";
import { BubbleMenuButton } from "./bubble-menu-button";

interface Props {
	editor: Editor;
}

export function ImageBubbleMenu({ editor }: Props) {
	function updateMediaSize() {
		const imageInfo = document.querySelector(
			".ProseMirror-selectednode",
		) as HTMLImageElement;

		if (!imageInfo) {
			return;
		}

		const selection = editor.state.selection;

		const setImage = editor.commands.setImage as (options: {
			src: string;
			width: number;
			height: number;
		}) => boolean;

		setImage({
			src: imageInfo.src,
			width: Number(imageInfo.style.width.replace("px", "")),
			height: Number(imageInfo.style.height.replace("px", "")),
		});

		editor.commands.setNodeSelection(selection.from);
	}

	function shouldShow({ editor }: { editor: Editor }) {
		return editor.isActive("image");
	}

	return (
		<>
			<TiptapBubbleMenu
				pluginKey="image-bubble-menu"
				editor={editor}
				updateDelay={0}
				shouldShow={shouldShow}
				tippyOptions={{
					duration: 125,
					offset: [0, 4],
					hideOnClick: true,
					placement: "top",
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

			{editor.isActive("image") && (
				<Moveable
					target={
						document.querySelector(
							".ProseMirror-selectednode",
						) as HTMLDivElement
					}
					origin={false}
					edge={false}
					throttleDrag={0}
					keepRatio
					resizable
					throttleResize={0}
					onResize={({ target, width, height, delta }) => {
						if (delta[0]) target.style.width = `${width}px`;
						if (delta[1]) target.style.height = `${height}px`;
					}}
					onResizeEnd={updateMediaSize}
					scalable
					throttleScale={0}
					renderDirections={["w", "e"]}
					onScale={({ target, transform }) => {
						target.style.transform = transform;
					}}
				/>
			)}
		</>
	);
}
