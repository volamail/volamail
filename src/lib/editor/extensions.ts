import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import type { Theme } from "../templates/theme";

export function getExtensionsFromTheme(theme: Theme) {
	return [StarterKit, Image];
}
