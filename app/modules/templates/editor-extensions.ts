import { Node, mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import type { Theme } from "./theme";

export function getExtensionsFromTheme(theme: Theme) {
	return [
		StarterKit.configure({
			paragraph: {
				HTMLAttributes: {
					style: "color: #52525b; line-height: 1.5;",
				},
			},
			horizontalRule: {
				HTMLAttributes: {
					style: "border-top: px solid #d4d4d8;",
				},
			},
			blockquote: {
				HTMLAttributes: {
					style:
						"border-left: 4px solid #d4d4d8; padding-left: 1em; font-style: italic; color: #52525b; margin: 0;",
				},
			},
		}),
		Link,
		Image.configure({
			HTMLAttributes: {
				style: "height: 32px;",
			},
		}),
		SmallText,
	];
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		smallText: {
			setSmallText: (attributes?: { class?: string }) => ReturnType;
			toggleSmallText: (attributes?: { class?: string }) => ReturnType;
		};
	}
}

const SmallText = Node.create({
	name: "smallText",
	content: "inline*",
	group: "block",
	defining: true,

	parseHtml() {
		return [
			{
				tag: "small",
			},
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		return [
			"small",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
			0,
		];
	},

	addCommands() {
		return {
			setSmallText:
				(attributes) =>
				({ commands }) => {
					return commands.setNode(this.name, attributes);
				},
			toggleSmallText:
				(attributes) =>
				({ commands }) => {
					return commands.toggleNode(this.name, "paragraph", attributes);
				},
		};
	},
});
