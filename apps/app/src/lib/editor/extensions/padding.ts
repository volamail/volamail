import "@tiptap/extension-text-style";

import { Extension } from "@tiptap/core";

export type PaddingOptions = {
  types: string[];
};

export const Padding = Extension.create<PaddingOptions>({
  name: "padding",

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
          padding: {
            default: null,
            parseHTML: (element) =>
              element.style.padding?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.padding) {
                return {};
              }

              return {
                style: `padding: ${attributes.padding}`,
              };
            },
          },
        },
      },
    ];
  },
});
