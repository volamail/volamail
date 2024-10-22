import * as v from "valibot";

export type Theme = {
	background: string;
	contentBackground: string;
	contentMaxWidth: string;
	contentBorderRadius: number;
};

export const DEFAULT_THEME: Theme = {
	background: "#eeeeee",
	contentBackground: "#ffffff",
	contentMaxWidth: "600px",
	contentBorderRadius: 2,
};

export const validTheme = v.object({
	background: v.string(),
	contentBackground: v.string(),
	contentMaxWidth: v.string(),
	contentBorderRadius: v.pipe(
		v.string(),
		v.transform((input) => Number(input)),
		v.number(),
		v.minValue(0),
	),
});
