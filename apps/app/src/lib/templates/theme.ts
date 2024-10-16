import * as v from "valibot";

export type Theme = {
	background: string;
	contentBackground: string;
	contentMaxWidth: string;
};

export const DEFAULT_THEME: Theme = {
	background: "#eeeeee",
	contentBackground: "#ffffff",
	contentMaxWidth: "600px",
};

export const validTheme = v.object({
	background: v.string(),
	contentBackground: v.string(),
	contentMaxWidth: v.string(),
});
