import TipTapImage, { type ImageOptions } from "@tiptap/extension-image";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		imageAlign: {
			setImageAlign: (alignment: string) => ReturnType;
			unsetImageAlign: () => ReturnType;
		};
	}
}

interface ExtendedImageOptions extends ImageOptions {
	alignments: string[];
	defaultAlignment: string;
}

export const Image = TipTapImage.extend<ExtendedImageOptions>({
	name: "image",
	addOptions() {
		return {
			...this.parent?.(),
			alignments: ["left", "center", "right"],
			defaultAlignment: "left",
		};
	},
	addAttributes() {
		return {
			...this.parent?.(),
			width: {
				default: null,
				renderHTML: (attributes) => {
					if (attributes.width) {
						return {
							width: attributes.width,
							style: `width: ${attributes.width}px`,
						};
					}
				},
				parseHTML: (element) => {
					return {
						width: element.getAttribute("width"),
					};
				},
			},
			height: {
				default: null,
				renderHTML: (attributes) => {
					if (attributes.height) {
						return {
							height: attributes.height,
							style: `height: ${attributes.height}px`,
						};
					}
				},
				parseHTML: (element) => {
					return {
						height: element.getAttribute("height"),
					};
				},
			},
			align: {
				default: this.options.defaultAlignment,
				parseHTML: (element) => {
					const alignment =
						element.getAttribute("align") || this.options.defaultAlignment;

					return this.options.alignments.includes(alignment)
						? alignment
						: this.options.defaultAlignment;
				},
				renderHTML: (attributes) => {
					if (attributes.align === this.options.defaultAlignment) {
						return {};
					}

					if (attributes.align === "center") {
						return {
							style: "display: block; margin-left: auto; margin-right: auto;",
						};
					}

					if (attributes.align === "right") {
						return {
							style: "display: block; margin-left: auto;",
						};
					}

					return {
						style: "display: block;",
					};
				},
			},
		};
	},
	addCommands() {
		return {
			setImageAlign:
				(alignment: string) =>
				({ commands }) => {
					if (!this.options.alignments.includes(alignment)) {
						return false;
					}

					return commands.updateAttributes("image", { align: alignment });
				},
			unsetImageAlign:
				() =>
				({ commands }) => {
					return commands.resetAttributes("image", "align");
				},
			setImage:
				(options: {
					src: string;
					width: number;
					height: number;
				}) =>
				({ commands }) => {
					return commands.updateAttributes("image", {
						src: options.src,
						width: options.width,
						height: options.height,
					})
				},
		};
	},
	addKeyboardShortcuts() {
		return {
			"Mod-Shift-l": () => this.editor.commands.setImageAlign("left"),
			"Mod-Shift-e": () => this.editor.commands.setImageAlign("center"),
			"Mod-Shift-r": () => this.editor.commands.setImageAlign("right"),
		};
	},
});
