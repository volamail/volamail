import type { Editor } from "@tiptap/core";
import { flushSync } from "react-dom";
import Moveable from "react-moveable";

interface Props {
	editor: Editor;
}

export function ImageResizer({ editor }: Props) {
	if (!editor.isActive("image")) {
		return null;
	}

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
		}) => boolean;

		setImage({
			src: imageInfo.src,
			width: Number(imageInfo.style.width.replace("px", "")),
		});
		editor.commands.setNodeSelection(selection.from);
	}

	return (
		<Moveable
			flushSync={flushSync}
			target={
				document.querySelector(".ProseMirror-selectednode") as HTMLDivElement
			}
			container={document.getElementById("editor-content") as HTMLDivElement}
			origin={false}
			edge={false}
			useResizeObserver
			useMutationObserver
			throttleDrag={0}
			keepRatio
			resizable
			throttleResize={0}
			onResize={({ target, width, height, delta }) => {
				if (delta[0]) target.style.width = `${width}px`;
				if (delta[1]) target.style.height = `${height}px`;
			}}
			onResizeEnd={updateMediaSize}
		/>
	);
}
