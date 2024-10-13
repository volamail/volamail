import "@tiptap/extension-text-style";

import { Extension } from "@tiptap/core";

export type BackgroundColorOptions = {
	types: string[];
};

export const BackgroundColor = Extension.create<BackgroundColorOptions>({
	name: "backgroundColor",

	addOptions() {
		return {
			types: ["textStyle"],
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					backgroundColor: {
						default: null,
						parseHTML: (element) =>
							element.style.backgroundColor?.replace(/['"]+/g, ""),
						renderHTML: (attributes) => {
							if (!attributes.backgroundColor) {
								return {};
							}

							return {
								style: `background-color: ${attributes.backgroundColor}`,
							};
						},
					},
				},
			},
		];
	},
});
