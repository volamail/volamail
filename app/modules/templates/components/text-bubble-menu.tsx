import type { Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { BubbleMenu as TipTapBubbleMenu, isTextSelection } from "@tiptap/react";
import {
	ALargeSmallIcon,
	AlignCenterIcon,
	AlignLeftIcon,
	AlignRightIcon,
	BoldIcon,
	ChevronDownIcon,
	Heading1Icon,
	Heading2Icon,
	Heading3Icon,
	ItalicIcon,
	LinkIcon,
	QuoteIcon,
	SeparatorHorizontalIcon,
	StrikethroughIcon,
} from "lucide-react";
import { type ComponentProps, useCallback } from "react";
import { BubbleMenuButton } from "./bubble-menu-button";
import { HyperlinkPopover } from "./hyperlink-popover";

interface Props {
	editor: Editor;
}

export function TextBubbleMenu(props: Props) {
	const createToolbarCommandHandler = useCallback(
		(
			command:
				| "h1"
				| "h2"
				| "h3"
				| "separator"
				| "blockquote"
				| "smallText"
				| "bold"
				| "italic"
				| "strikethrough",
		) => {
			return () => {
				if (command === "h1") {
					return props.editor.chain().focus().toggleHeading({ level: 1 }).run();
				}

				if (command === "h2") {
					return props.editor.chain().focus().toggleHeading({ level: 2 }).run();
				}

				if (command === "h3") {
					return props.editor.chain().focus().toggleHeading({ level: 3 }).run();
				}

				if (command === "separator") {
					return props.editor.chain().focus().setHorizontalRule().run();
				}

				if (command === "blockquote") {
					return props.editor.chain().focus().toggleBlockquote().run();
				}

				if (command === "smallText") {
					return props.editor.chain().focus().toggleSmallText().run();
				}

				if (command === "bold") {
					return props.editor.chain().focus().toggleBold().run();
				}

				if (command === "italic") {
					return props.editor.chain().focus().toggleItalic().run();
				}

				if (command === "strikethrough") {
					return props.editor.chain().focus().toggleStrike().run();
				}
			};
		},
		[props.editor],
	);

	function shouldShow({
		editor,
		state,
		from,
		to,
		view,
	}: {
		editor: Editor;
		view: EditorView;
		state: EditorState;
		from: number;
		to: number;
	}) {
		const { doc, selection } = state;
		const { empty } = selection;

		const isEmptyTextBlock =
			!doc.textBetween(from, to).length && isTextSelection(state.selection);

		const isChildOfMenu = this.element.contains(document.activeElement);

		const hasEditorFocus = view.hasFocus() || isChildOfMenu;

		if (
			!hasEditorFocus ||
			empty ||
			isEmptyTextBlock ||
			!this.editor.isEditable
		) {
			return false;
		}

		return !editor.isActive("horizontalRule") && !editor.isActive("image");
	}

	return (
		<TipTapBubbleMenu
			pluginKey="text-bubble-menu"
			updateDelay={0}
			editor={props.editor}
			shouldShow={shouldShow}
			tippyOptions={{
				duration: 125,
				offset: [0, 4],
				hideOnClick: true,
				maxWidth: 600,
			}}
		>
			<div className="relative flex min-w-0 items-center gap-1 rounded-lg p-1 shadow-lg transition-all dark:bg-gray-900">
				<div className="flex min-w-0 shrink-0 gap-0.5">
					<BubbleMenuButton
						aria-label="Set heading level 1"
						onClick={createToolbarCommandHandler("h1")}
						active={props.editor.isActive("heading", { level: 1 })}
					>
						<Heading1Icon className="size-4" />
					</BubbleMenuButton>
					<BubbleMenuButton
						aria-label="Set heading level 2"
						onClick={createToolbarCommandHandler("h2")}
						active={props.editor.isActive("heading", { level: 2 })}
					>
						<Heading2Icon className="size-4" />
					</BubbleMenuButton>
					<BubbleMenuButton
						aria-label="Set heading level 3"
						onClick={createToolbarCommandHandler("h3")}
						active={props.editor.isActive("heading", { level: 3 })}
					>
						<Heading3Icon className="size-4" />
					</BubbleMenuButton>
					<BubbleMenuButton
						aria-label="Set small text"
						className="gap-1"
						onClick={createToolbarCommandHandler("smallText")}
						active={props.editor.isActive("smallText")}
					>
						<ALargeSmallIcon className="size-4" />
					</BubbleMenuButton>
				</div>

				<div className="h-6 w-px shrink-0 bg-gray-300 dark:bg-gray-700" />

				<div className="flex min-w-0 shrink-0 gap-0.5">
					<BubbleMenuButton
						aria-label="Set align left"
						onClick={() => props.editor.commands.setTextAlign("left")}
						active={props.editor.isActive({ textAlign: "left" })}
					>
						<AlignLeftIcon className="size-4" />
					</BubbleMenuButton>
					<BubbleMenuButton
						aria-label="Set align center"
						onClick={() => props.editor.commands.setTextAlign("center")}
						active={props.editor.isActive({ textAlign: "center" })}
					>
						<AlignCenterIcon className="size-4" />
					</BubbleMenuButton>
					<BubbleMenuButton
						aria-label="Set align right"
						onClick={() => props.editor.commands.setTextAlign("right")}
						active={props.editor.isActive({ textAlign: "right" })}
					>
						<AlignRightIcon className="size-4" />
					</BubbleMenuButton>
				</div>

				<div className="h-6 w-px shrink-0 bg-gray-300 dark:bg-gray-700" />

				<div className="flex min-w-0 shrink-0 gap-0.5">
					<BubbleMenuButton
						aria-label="Set bold"
						onClick={createToolbarCommandHandler("bold")}
						active={props.editor.isActive("bold")}
					>
						<BoldIcon className="size-4" />
					</BubbleMenuButton>
					<BubbleMenuButton
						aria-label="Set italic"
						onClick={createToolbarCommandHandler("italic")}
						active={props.editor.isActive("italic")}
					>
						<ItalicIcon className="size-4" />
					</BubbleMenuButton>
					<BubbleMenuButton
						aria-label="Set strikethrough"
						onClick={createToolbarCommandHandler("strikethrough")}
						active={props.editor.isActive("strike")}
					>
						<StrikethroughIcon className="size-4" />
					</BubbleMenuButton>
				</div>

				<div className="h-6 w-px shrink-0 bg-gray-300 dark:bg-gray-700" />

				<div className="flex min-w-0 shrink-0 gap-0.5">
					<BubbleMenuButton
						aria-label="Set blockquote"
						onClick={createToolbarCommandHandler("blockquote")}
						active={props.editor.isActive("blockquote")}
					>
						<QuoteIcon className="size-4" />
					</BubbleMenuButton>
					<BubbleMenuButton
						aria-label="Set horizontal rule"
						onClick={createToolbarCommandHandler("separator")}
						active={props.editor.isActive("horizontalRule")}
					>
						<SeparatorHorizontalIcon className="size-4" />
					</BubbleMenuButton>

					<HyperlinkPopover
						onSet={(href) => props.editor.commands.setLink({ href })}
						onUnset={() => props.editor.commands.unsetLink()}
						trigger={
							<BubbleMenuButton
								aria-label="Insert link"
								active={props.editor.isActive("link")}
								className="gap-1"
							>
								<LinkIcon className="size-4" />
								<ChevronDownIcon className="size-3" />
							</BubbleMenuButton>
						}
					/>
				</div>
			</div>
		</TipTapBubbleMenu>
	);
}
