import Image from "@tiptap/extension-image";
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
		Image.configure({
			HTMLAttributes: {
				style: "height: 32px;",
			},
		}),
	];
}
