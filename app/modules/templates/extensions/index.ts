import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import type { Theme } from "../theme";
import { Image } from "./image";
import { SmallText } from "./small-text";

export function getExtensionsFromTheme(theme: Theme) {
	return [
		StarterKit,
		Link,
		Image,
		SmallText,
		TextAlign.configure({
			types: ["heading", "paragraph", "smallText", "image"],
		}),
	];
}
