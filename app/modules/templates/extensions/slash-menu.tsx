import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import {
	BetweenHorizonalEndIcon,
	Heading1Icon,
	Heading2Icon,
	Heading3Icon,
	QuoteIcon,
	UnfoldVerticalIcon,
} from "lucide-react";
import type { ComponentRef } from "react";
import tippy, { type Instance } from "tippy.js";
import { SlashMenuContents } from "../components/slash-menu-contents";

export const SlashMenu = Extension.create({
	name: "slash-menu",

	addOptions() {
		return {
			suggestion: {
				char: "/",
				command: ({ editor, range, props }) => {
					props.command({ editor, range });
				},
				items: ({ query }) => {
					const items = [
						[
							{
								title: "Heading 1",
								icon: Heading1Icon,
								command: ({ editor, range }) => {
									editor
										.chain()
										.focus()
										.deleteRange(range)
										.setNode("heading", { level: 1 })
										.run();
								},
							},
							{
								title: "Heading 2",
								icon: Heading2Icon,
								command: ({ editor, range }) => {
									editor
										.chain()
										.focus()
										.deleteRange(range)
										.setNode("heading", { level: 2 })
										.run();
								},
							},
							{
								title: "Heading 3",
								icon: Heading3Icon,
								command: ({ editor, range }) => {
									editor
										.chain()
										.focus()
										.deleteRange(range)
										.setNode("heading", { level: 3 })
										.run();
								},
							},
						],
						[
							{
								title: "Insert section",
								icon: BetweenHorizonalEndIcon,
								command: ({ editor, range }) => {
									editor.chain().focus().deleteRange(range).setSection().run();
								},
							},
						],
						[
							{
								title: "Divider",
								icon: UnfoldVerticalIcon,
								command: ({ editor, range }) => {
									editor
										.chain()
										.focus()
										.deleteRange(range)
										.setHorizontalRule()
										.run();
								},
							},
							{
								title: "Blockquote",
								icon: QuoteIcon,
								command: ({ editor, range }) => {
									editor
										.chain()
										.focus()
										.deleteRange(range)
										.toggleBlockquote()
										.run();
								},
							},
						],
					];

					if (query) {
						return items
							.map((group) =>
								group.filter((item) =>
									item.title.toLowerCase().includes(query.toLowerCase()),
								),
							)
							.filter((group) => group.length > 0);
					}

					return items;
				},
				render() {
					let component: ReactRenderer<
						ComponentRef<typeof SlashMenuContents>
					> | null = null;
					let popup: Instance[] | null = null;

					return {
						async onStart(params) {
							component = new ReactRenderer(SlashMenuContents, {
								props: params,
								editor: params.editor,
							});

							popup = tippy("body", {
								getReferenceClientRect: () => {
									const rect = params.clientRect?.();

									return rect!;
								},
								appendTo: () => document.body,
								content: component.element,
								showOnCreate: true,
								interactive: true,
								trigger: "manual",
								placement: "bottom-start",
							});
						},
						onUpdate(props) {
							component?.updateProps(props);

							if (!props.clientRect) {
								return;
							}

							popup?.[0].setProps({
								getReferenceClientRect: () => {
									const rect = props.clientRect?.();

									return rect!;
								},
							});
						},

						onKeyDown(props) {
							if (props.event.key === "Escape") {
								popup?.[0].hide();

								return true;
							}

							return component?.ref?.keyDown(props.event);
						},

						onExit() {
							popup?.[0].destroy();

							component?.destroy();
						},
					};
				},
			} as Partial<SuggestionOptions>,
		};
	},

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				...this.options.suggestion,
			}),
		];
	},
});
