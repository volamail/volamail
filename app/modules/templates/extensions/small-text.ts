import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		smallText: {
			setSmallText: (attributes?: { class?: string }) => ReturnType;
			toggleSmallText: (attributes?: { class?: string }) => ReturnType;
		};
	}
}

export const SmallText = Node.create({
	name: "smallText",
	content: "inline*",
	group: "block",
	defining: true,

	parseHtml() {
		return [
			{
				tag: "p",
				getAttrs: (node: HTMLElement) =>
					node.style.fontSize === "small" && null,
			},
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		return [
			"p",
			mergeAttributes(
				{
					style: "font-size: small;",
				},
				this.options.HTMLAttributes,
				HTMLAttributes,
			),
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
