import { Node, mergeAttributes, wrappingInputRule } from "@tiptap/core";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		section: {
			setSection: () => ReturnType;
			setSectionBackgroundColor: (color: string) => ReturnType;
			setSectionPadding: (padding: string) => ReturnType;
			unsetSection: () => ReturnType;
		};
	}
}

export const Section = Node.create({
	name: "section",
	content: "block+",
	group: "sections",
	defining: true,

	addAttributes() {
		return {
			backgroundColor: {
				default: "#ffffff",
				parseHTML: (element) => {
					return element.style.backgroundColor;
				},
				renderHTML: (attributes) => {
					return {
						style: `background-color: ${attributes.backgroundColor};`,
					};
				},
			},
			padding: {
				default: "4em",
				parseHTML: (element) => {
					return element.style.padding;
				},
				renderHTML: (attributes) => {
					return {
						style: `padding: ${attributes.padding};`,
					};
				},
			},
		};
	},

	addOptions() {
		return {
			HTMLAttributes: {
				style: "width: 100%;",
			},
		};
	},

	parseHtml() {
		return [
			{
				tag: "table",
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		return [
			"table",
			{
				style: "width: 100%;",
				"cell-padding": 0,
				"cell-spacing": 0,
				border: 0,
			},
			[
				"tr",
				["td", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0],
			],
		];
	},

	addCommands() {
		return {
			setSection:
				() =>
				({ commands, state }) => {
					return commands.insertContentAt(state.selection.to + 1, {
						type: this.name,
						attrs: {
							backgroundColor: getRandomColor(),
						},
						content: [
							{
								type: "paragraph",
								text: "",
							},
						],
					});
				},
			unsetSection:
				() =>
				({ commands }) => {
					return commands.deleteNode(this.name);
				},
			setSectionBackgroundColor:
				(color: string) =>
				({ commands }) => {
					return commands.updateAttributes(this.name, {
						backgroundColor: color,
					});
				},
			setSectionPadding:
				(padding: string) =>
				({ commands }) => {
					return commands.updateAttributes(this.name, {
						padding,
					});
				},
		};
	},
});

function getRandomColor() {
	const letters = "0123456789ABCDEF";

	let color = "#";

	for (let i = 0; i < 6; i++) {
		const letterIdx =
			i % 2 === 0 ? getRandomIntInRange(13, 16) : getRandomIntInRange(0, 16);

		color += letters[letterIdx];
	}

	return color;
}

function getRandomIntInRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min) + min);
}
