import type { Editor as TipTapEditor } from "@tiptap/core";
import {
	Heading1Icon,
	Heading2Icon,
	Heading3Icon,
	ImagePlusIcon,
	SeparatorHorizontalIcon,
} from "lucide-solid";
import { type ComponentProps, splitProps } from "solid-js";
import { PopoverRoot, PopoverTrigger } from "~/lib/ui/components/popover";
import { cn } from "~/lib/ui/utils/cn";
import { ImagePicker } from "./image-picker";

type ToolbarProps = {
	editor: TipTapEditor;
	projectId: string;
};

export function Toolbar(props: ToolbarProps) {
	return (
		<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex border border-gray-300 rounded-full overflow-hidden">
			<ToolbarGroup>
				<PopoverRoot>
					<PopoverTrigger as={ToolbarButton} class="pl-1.5">
						<ImagePlusIcon class="size-4" />
					</PopoverTrigger>
					<ImagePicker
						projectId={props.projectId}
						onSelect={(url) => {
							if (!url) {
								return;
							}

							props.editor.chain().focus().setImage({ src: url }).run();
						}}
					/>
				</PopoverRoot>
			</ToolbarGroup>
			<ToolbarGroup>
				<ToolbarButton
					active={props.editor.isActive("heading", { level: 1 })}
					onClick={() =>
						props.editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
				>
					<Heading1Icon class="size-4" />
				</ToolbarButton>
				<ToolbarButton
					active={props.editor.isActive("heading", { level: 2 })}
					onClick={() =>
						props.editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
				>
					<Heading2Icon class="size-4" />
				</ToolbarButton>
				<ToolbarButton
					active={props.editor.isActive("heading", { level: 3 })}
					onClick={() =>
						props.editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
				>
					<Heading3Icon class="size-4" />
				</ToolbarButton>
			</ToolbarGroup>
			<ToolbarGroup>
				<ToolbarButton
					class="pr-1.5"
					onClick={() => props.editor.chain().focus().setHorizontalRule().run()}
				>
					<SeparatorHorizontalIcon class="size-4" />
				</ToolbarButton>
			</ToolbarGroup>
		</div>
	);
}

function ToolbarGroup(props: ComponentProps<"div">) {
	const [local, rest] = splitProps(props, ["class"]);

	return (
		<div
			class={cn("flex border-gray-300 border-r last:border-r-0", local.class)}
			{...rest}
		/>
	);
}

type ToolbarButtonProps = ComponentProps<"button"> & {
	active?: boolean;
};

function ToolbarButton(props: ToolbarButtonProps) {
	const [local, rest] = splitProps(props, ["class", "active"]);

	return (
		<button
			type="button"
			class={cn(
				"p-1 bg-gray-100 text-gray-400 hover:bg-gray-300 transition-colors",
				local.active && "bg-gray-200 text-black border-b border-black",
				local.class,
			)}
			{...rest}
		/>
	);
}
