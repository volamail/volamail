import { ActionButton } from "@/modules/ui/components/action-button";
import { cn } from "@/modules/ui/utils/cn";
import type { Editor } from "@tiptap/core";
import {
	Heading1Icon,
	Heading2Icon,
	Heading3Icon,
	ImagePlusIcon,
	QuoteIcon,
	SeparatorHorizontalIcon,
} from "lucide-react";
import { type ComponentProps, useCallback } from "react";

interface Props {
	editor: Editor;
}

export function Toolbar(props: Props) {
	const createToolbarCommandHandler = useCallback(
		(command: "h1" | "h2" | "h3" | "separator" | "blockquote") => {
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
			};
		},
		[props.editor],
	);

	return (
		<div className="absolute bottom-4 left-1/2 -translate-x-1/2 hover:bottom-5 flex gap-[1px] dark:bg-gray-700 shadow-2xl shadow-black z-0 items-center rounded-full overflow-hidden transition-all opacity-50 hover:opacity-100">
			<ToolbarButton className="pl-2.5" aria-label="Add image">
				<ImagePlusIcon className="size-4" />
			</ToolbarButton>
			<div className="flex">
				<ToolbarButton
					aria-label="Set heading level 1"
					onClick={createToolbarCommandHandler("h1")}
					active={props.editor.isActive("heading", { level: 1 })}
				>
					<Heading1Icon className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					aria-label="Set heading level 2"
					onClick={createToolbarCommandHandler("h2")}
					active={props.editor.isActive("heading", { level: 2 })}
				>
					<Heading2Icon className="size-4" />
				</ToolbarButton>
				<ToolbarButton
					aria-label="Set heading level 3"
					onClick={createToolbarCommandHandler("h3")}
					active={props.editor.isActive("heading", { level: 3 })}
				>
					<Heading3Icon className="size-4" />
				</ToolbarButton>
			</div>
			<ToolbarButton
				aria-label="Set blockquote"
				onClick={createToolbarCommandHandler("blockquote")}
				active={props.editor.isActive("blockquote")}
			>
				<QuoteIcon className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				className="pr-2.5"
				aria-label="Set horizontal rule"
				onClick={createToolbarCommandHandler("separator")}
				active={props.editor.isActive("horizontalRule")}
			>
				<SeparatorHorizontalIcon className="size-4" />
			</ToolbarButton>
		</div>
	);
}

function ToolbarButton({
	className,
	active,
	...props
}: ComponentProps<typeof ActionButton> & {
	active?: boolean;
}) {
	return (
		<ActionButton
			color="neutral"
			className={cn(
				"dark:bg-gray-900 dark:text-gray-400 hover:dark:text-gray-50 rounded-none border-none",
				active && "dark:bg-gray-700 dark:text-gray-300",
				className,
			)}
			{...props}
		/>
	);
}
