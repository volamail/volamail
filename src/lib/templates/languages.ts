import { literal, union } from "valibot";

export const TEMPLATE_LANGUAGES = ["en", "it", "fr", "es", "de"] as const;

export const TEMPLATE_LANGUAGES_MAP: Record<
	TemplateLanguage,
	{
		label: string;
		flagCode: string;
	}
> = {
	en: {
		label: "English",
		flagCode: "us",
	},
	it: {
		label: "Italian",
		flagCode: "it",
	},
	fr: {
		label: "French",
		flagCode: "fr",
	},
	es: {
		label: "Spanish",
		flagCode: "es",
	},
	de: {
		label: "German",
		flagCode: "de",
	},
};

export type TemplateLanguage = (typeof TEMPLATE_LANGUAGES)[number];

export const validTemplateLanguage = union(
	TEMPLATE_LANGUAGES.map((language) => literal(language)),
);
