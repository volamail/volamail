import "@tiptap/extension-text-style";

import { Extension } from "@tiptap/core";

export type BorderRadiusOptions = {
  types: string[];
};

export const BorderRadius = Extension.create<BorderRadiusOptions>({
  name: "borderRadius",

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
          borderRadius: {
            default: null,
            parseHTML: (element) =>
              element.style.borderRadius?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.borderRadius) {
                return {};
              }

              return {
                style: `border-radius: ${attributes.borderRadius}`,
              };
            },
          },
        },
      },
    ];
  },
});
