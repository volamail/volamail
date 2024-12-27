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
