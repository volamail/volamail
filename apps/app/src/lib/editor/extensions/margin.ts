import "@tiptap/extension-text-style";

import { Extension } from "@tiptap/core";

export type MarginOptions = {
	types: string[];
};

export const Margin = Extension.create<MarginOptions>({
	name: "margin",

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
					margin: {
						default: null,
						parseHTML: (element) => {
							const fullMargin = element.style.margin?.replace(/['"]+/g, "");

							if (fullMargin) {
								return fullMargin;
							}

							const marginTop = element.style.marginTop?.replace(/['"]+/g, "");
							const marginBottom = element.style.marginBottom?.replace(
								/['"]+/g,
								"",
							);
							const marginLeft = element.style.marginLeft?.replace(
								/['"]+/g,
								"",
							);
							const marginRight = element.style.marginRight?.replace(
								/['"]+/g,
								"",
							);

							if (marginTop || marginBottom || marginLeft || marginRight) {
								return `${marginTop || "0px"} ${marginRight || "0px"} ${
									marginBottom || "0px"
								} ${marginLeft || "0px"}`;
							}

							return;
						},
						renderHTML: (attributes) => {
							if (!attributes.margin) {
								return {};
							}

							return {
								style: `margin: ${attributes.margin}`,
							};
						},
					},
				},
			},
		];
	},
});
