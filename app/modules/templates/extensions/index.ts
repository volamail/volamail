import Document from "@tiptap/extension-document";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import type { Theme } from "../theme";
import { Image } from "./image";
import { Section } from "./section";
import { SmallText } from "./small-text";

export function getExtensionsFromTheme(theme: Theme) {
	return [
		StarterKit.configure({ document: false }),
		CustomDocument,
		Link,
		Image,
		SmallText,
		TextAlign.configure({
			types: ["heading", "paragraph", "smallText", "image"],
		}),
		Section.configure({
			HTMLAttributes: {
				style: "width: 100%;",
			},
		}),
	];
}

const CustomDocument = Document.extend({
	content: "sections+",
});
